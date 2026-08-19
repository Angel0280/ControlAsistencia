/* ============================================================
   VIEWS / PLANILLA.JS
   Vista del módulo de Planilla y Deducciones.
   - Filtrar por mes/año/quincena.
   - Generar planilla del período.
   - KPIs de totales.
   - Tabla con detalle de deducciones por empleado.
   ============================================================ */

import { api } from '../api.js';
import { toast } from '../toast.js';
import { formatMoney, escapeHtml } from '../utils.js';

let container = null;

/* ============================================================
   RENDER
   ============================================================ */

export async function render(el) {
  container = el;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  container.innerHTML = `
    <div class="animate-fade-in">

      <div class="topbar">
        <h2>Planilla</h2>
        <button id="btn-generar-planilla" class="btn primary">Generar planilla del período</button>
      </div>

      <!-- Filtros -->
      <div class="filters-row">
        <div class="field">
          <span class="lbl">Mes</span>
          <select id="filtro-mes" class="input">
            ${[
              'Enero','Febrero','Marzo','Abril','Mayo','Junio',
              'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
            ].map((m, i) =>
              `<option value="${i + 1}" ${i + 1 === currentMonth ? 'selected' : ''}>${m}</option>`
            ).join('')}
          </select>
        </div>
        <div class="field">
          <span class="lbl">Año</span>
          <input id="filtro-anio" type="number" class="input" value="${currentYear}" min="2020" max="2050">
        </div>
        <div class="field">
          <span class="lbl">Quincena</span>
          <select id="filtro-quincena" class="input">
            <option value="1">1ra quincena</option>
            <option value="2">2da quincena</option>
          </select>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-row">
        <div class="box kpi-card">
          <span class="lbl">Total empleados</span>
          <div class="num" id="kpi-empleados">—</div>
        </div>
        <div class="box kpi-card">
          <span class="lbl">Salario bruto total</span>
          <div class="num" id="kpi-bruto">C$ 0.00</div>
        </div>
        <div class="box kpi-card">
          <span class="lbl">Total deducciones</span>
          <div class="num" id="kpi-deducciones">C$ 0.00</div>
        </div>
        <div class="box kpi-card">
          <span class="lbl">Salario neto total</span>
          <div class="num" id="kpi-neto">C$ 0.00</div>
        </div>
      </div>

      <!-- Tabla + Panel de deducciones -->
      <div class="two-col">
        <div class="box" style="padding:0; overflow:auto;">
          <table class="wf">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Bruto</th>
                <th>H. Extra</th>
                <th>Ausencias</th>
                <th>Deducciones</th>
                <th>Neto</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="tabla-planilla-body">
              <tr><td colspan="7">
                <div class="tabla-vacia">
                  <div class="icono">💰</div>
                  <p>Genera la planilla para ver los resultados</p>
                </div>
              </td></tr>
            </tbody>
          </table>
        </div>

        <div class="box soft" style="padding: var(--space-4);" id="panel-deducciones">
          <span class="lbl">Detalle de deducciones</span>
          <p style="color: var(--text-muted); font-size: var(--text-sm); margin-top: var(--space-3);">
            Selecciona un empleado en la tabla para ver el desglose
          </p>
        </div>
      </div>

    </div>
  `;

  // Event listeners
  container.querySelector('#btn-generar-planilla').addEventListener('click', generarPlanilla);

  // Delegación para "Ver detalle" en la tabla
  container.querySelector('#tabla-planilla-body').addEventListener('click', (e) => {
    if (e.target.classList.contains('ver-detalle')) {
      const fila = e.target.closest('tr');
      if (fila) cargarDetalleDeducciones(fila.dataset.idEmpleado, fila.dataset.nombre);
    }
  });
}

/* ============================================================
   DESTROY
   ============================================================ */

export function destroy() {
  container = null;
}

/* ============================================================
   GENERAR PLANILLA
   ============================================================ */

async function generarPlanilla() {
  const mes = container.querySelector('#filtro-mes').value;
  const anio = container.querySelector('#filtro-anio').value;
  const quincena = container.querySelector('#filtro-quincena').value;

  try {
    const data = await api.post('/api/planilla/generar', { mes, anio, quincena });

    if (data.detalle) renderizarTabla(data.detalle);
    if (data.totales) renderizarKpis(data.totales);

    toast.success('Planilla generada correctamente');
  } catch (err) {
    toast.error(err.message || 'No se pudo generar la planilla');
  }
}

/* ============================================================
   RENDERIZADO
   ============================================================ */

function renderizarKpis(totales) {
  const set = (id, val) => {
    const el = container?.querySelector(`#${id}`);
    if (el) el.textContent = val;
  };

  set('kpi-empleados', totales.total_empleados || 0);
  set('kpi-bruto', formatMoney(totales.bruto));
  set('kpi-deducciones', formatMoney(totales.deducciones));
  set('kpi-neto', formatMoney(totales.neto));
}

function renderizarTabla(filas) {
  const tbody = container?.querySelector('#tabla-planilla-body');
  if (!tbody) return;

  if (!filas.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="tabla-vacia">
          <div class="icono">💰</div>
          <p>No hay registros para este período</p>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = filas.map(f => `
    <tr data-id-empleado="${f.id_empleado}" data-nombre="${escapeHtml(f.nombre || '')}">
      <td><strong>${escapeHtml(f.nombre || '—')}</strong></td>
      <td>${formatMoney(f.bruto)}</td>
      <td>${formatMoney(f.horas_extra)}</td>
      <td>${formatMoney(f.ausencias)}</td>
      <td>${formatMoney(f.deducciones)}</td>
      <td><strong>${formatMoney(f.neto)}</strong></td>
      <td><span class="tag ver-detalle">Ver detalle</span></td>
    </tr>
  `).join('');
}

/* ============================================================
   DETALLE DE DEDUCCIONES
   ============================================================ */

async function cargarDetalleDeducciones(idEmpleado, nombre) {
  const panel = container?.querySelector('#panel-deducciones');
  if (!panel) return;

  panel.innerHTML = `
    <span class="lbl">Deducciones de ${escapeHtml(nombre || 'empleado')}</span>
    <div class="loading-screen" style="min-height: 100px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const data = await api.get(`/api/planilla/deducciones/${idEmpleado}`);

    if (!data || !data.length) {
      panel.innerHTML = `
        <span class="lbl">Deducciones de ${escapeHtml(nombre || 'empleado')}</span>
        <p style="color: var(--text-muted); font-size: var(--text-sm); margin-top: var(--space-3);">
          Este empleado no tiene deducciones registradas
        </p>
      `;
      return;
    }

    panel.innerHTML = `
      <span class="lbl">Deducciones de ${escapeHtml(nombre || 'empleado')}</span>
      <div class="status-list" style="padding: 0; margin-top: var(--space-3);">
        ${data.map(d => `
          <div class="row">
            <span>${escapeHtml(d.nombre || d.tipo || '—')}</span>
            <span><strong>${formatMoney(d.monto)}</strong></span>
          </div>
        `).join('')}
      </div>
    `;
  } catch {
    panel.innerHTML = `
      <span class="lbl">Deducciones</span>
      <p style="color: var(--danger); font-size: var(--text-sm); margin-top: var(--space-3);">
        Error al cargar las deducciones
      </p>
    `;
  }
}
