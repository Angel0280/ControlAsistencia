/* ============================================================
   VIEWS / ASISTENCIA.JS
   Vista del módulo de Control de Asistencia.
   - Kiosko de marcaje con reloj en vivo.
   - Tabla administrativa de asistencia del día.
   ============================================================ */

import { api } from '../api.js';
import { toast } from '../toast.js';
import { getCurrentTime, getCurrentDate, formatTime, escapeHtml } from '../utils.js';

let container = null;
let clockInterval = null;

/* ============================================================
   RENDER
   ============================================================ */

export async function render(el) {
  container = el;

  container.innerHTML = `
    <div class="animate-fade-in">

      <div class="topbar">
        <h2>Control de Asistencia</h2>
        <button id="btn-registrar-manual" class="btn primary">+ Registrar manual</button>
      </div>

      <!-- Kiosko de marcaje -->
      <div class="kiosk">
        <div class="box clock-card">
          <span class="lbl">Hora actual</span>
          <div class="clock-time" id="clock-time">${getCurrentTime()}</div>
          <div class="clock-date" id="clock-date">${getCurrentDate()}</div>

          <div class="kiosk-actions">
            <button id="btn-marcar-entrada" class="btn primary">MARCAR ENTRADA</button>
            <button id="btn-marcar-salida" class="btn ghost">MARCAR SALIDA</button>
          </div>

          <div class="meta-row">
            <span class="meta-chip">📍 Ubicación: Oficina Central</span>
            <span class="meta-chip">🌐 IP: detectada por el backend</span>
            <span class="meta-chip estado-dia" id="estado-dia">Estado del día: — sin marcar —</span>
          </div>
        </div>

        <div class="box status-list">
          <span class="lbl">Historial reciente</span>
          <div id="historial-container">
            <div class="loading-screen" style="min-height:150px;">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de asistencia del día -->
      <h3 style="margin-bottom: var(--space-3);">Asistencia del día — Todos los empleados</h3>
      <div class="filters-row">
        <div class="field">
          <span class="lbl">Fecha</span>
          <input type="date" id="filtro-fecha-asistencia" class="input"
                 value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="field">
          <span class="lbl">Departamento</span>
          <select id="filtro-depto-asistencia" class="input">
            <option value="">Todos</option>
          </select>
        </div>
        <button id="btn-filtrar-asistencia" class="btn ghost">Filtrar</button>
      </div>

      <div class="box" style="padding:0; overflow:auto;">
        <table class="wf">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Depto.</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas</th>
              <th>Ubicación</th>
              <th>IP marcaje</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="tabla-asistencia-body">
            <tr><td colspan="8" class="tabla-vacia">
              <div class="spinner"></div>
            </td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;

  // Reloj en vivo
  clockInterval = setInterval(updateClock, 1000);

  // Event listeners
  container.querySelector('#btn-marcar-entrada')?.addEventListener('click', () => marcarAsistencia('entrada'));
  container.querySelector('#btn-marcar-salida')?.addEventListener('click', () => marcarAsistencia('salida'));
  container.querySelector('#btn-filtrar-asistencia')?.addEventListener('click', cargarTablaAsistencia);

  // Cargar datos
  await Promise.all([cargarHistorial(), cargarTablaAsistencia()]);
}

/* ============================================================
   DESTROY
   ============================================================ */

export function destroy() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
  container = null;
}

/* ============================================================
   RELOJ EN VIVO
   ============================================================ */

function updateClock() {
  const horaEl = container?.querySelector('#clock-time');
  const fechaEl = container?.querySelector('#clock-date');
  if (horaEl) horaEl.textContent = getCurrentTime();
  if (fechaEl) fechaEl.textContent = getCurrentDate();
}

/* ============================================================
   MARCAJE
   ============================================================ */

async function marcarAsistencia(tipo) {
  try {
    const data = await api.post('/api/asistencia/marcar', {
      tipo: tipo,
    });

    toast.success(`${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`);

    const estadoEl = container?.querySelector('#estado-dia');
    if (estadoEl && data?.estado) {
      estadoEl.textContent = `Estado del día: ${data.estado}`;
    }

    // Refrescar historial y tabla
    await Promise.all([cargarHistorial(), cargarTablaAsistencia()]);
  } catch (err) {
    toast.error(err.message || 'No se pudo registrar el marcaje');
  }
}

/* ============================================================
   HISTORIAL RECIENTE
   ============================================================ */

async function cargarHistorial() {
  const el = container?.querySelector('#historial-container');
  if (!el) return;

  try {
    const data = await api.get('/api/asistencia/historial?limit=5');
    if (!data || !data.length) {
      el.innerHTML = '<p style="padding: var(--space-3); color: var(--text-muted); font-size: var(--text-sm);">Sin registros recientes</p>';
      return;
    }

    el.innerHTML = data.map(r => `
      <div class="row">
        <span>${escapeHtml(r.fecha || '—')}</span>
        <span>${formatTime(r.hora_entrada)} – ${formatTime(r.hora_salida)}</span>
        <span class="tag ${(r.estado || '').toLowerCase()}">${escapeHtml(r.estado || '—')}</span>
      </div>
    `).join('');
  } catch {
    el.innerHTML = '<p style="padding: var(--space-3); color: var(--text-muted); font-size: var(--text-sm);">No se pudo cargar el historial</p>';
  }
}

/* ============================================================
   TABLA ADMINISTRATIVA
   ============================================================ */

async function cargarTablaAsistencia() {
  const tbody = container?.querySelector('#tabla-asistencia-body');
  if (!tbody) return;

  const fecha = container.querySelector('#filtro-fecha-asistencia')?.value || '';
  const depto = container.querySelector('#filtro-depto-asistencia')?.value || '';

  const params = new URLSearchParams();
  if (fecha) params.set('fecha', fecha);
  if (depto) params.set('departamento', depto);

  try {
    const registros = await api.get(`/api/asistencia?${params.toString()}`);

    if (!registros.length) {
      tbody.innerHTML = `
        <tr><td colspan="8">
          <div class="tabla-vacia">
            <div class="icono">⏱️</div>
            <p>No hay registros de asistencia para este día</p>
          </div>
        </td></tr>
      `;
      return;
    }

    tbody.innerHTML = registros.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.empleado || '—')}</strong></td>
        <td>${escapeHtml(r.departamento || '—')}</td>
        <td>${formatTime(r.hora_entrada)}</td>
        <td>${formatTime(r.hora_salida)}</td>
        <td>${r.horas_trabajadas ?? '—'}</td>
        <td>${escapeHtml(r.ubicacion || '—')}</td>
        <td><code>${escapeHtml(r.ip_marcaje || '—')}</code></td>
        <td><span class="tag ${(r.estado || '').toLowerCase()}">${escapeHtml(r.estado || '—')}</span></td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="tabla-vacia">
          <p>Error al cargar la asistencia</p>
        </div>
      </td></tr>
    `;
  }
}
