/* ============================================================
   VIEWS / EVALUACIONES.JS
   Vista completa del módulo de Evaluación de Desempeño.
   - Seleccionar empleado para ver historial
   - KPIs dinámicos (última puntuación, promedio, total, mejor categoría)
   - Tabla con historial y tags de color por rango
   - Modal de nueva evaluación con checklist dinámico y cálculo en tiempo real
   - Modal de detalle con barras visuales por categoría
   ============================================================ */

import { api } from '../api.js';
import { toast } from '../toast.js';
import { escapeHtml, formatDate, fillSelect } from '../utils.js';
import { openModal, closeModal, initModalCloseButtons } from '../components/modal.js';

/** Estado local de la vista */
let container = null;
let categorias = [];      // Categorías de evaluación cargadas de la API
let empleados = [];       // Lista de empleados para los selects
let historial = [];       // Historial del empleado seleccionado

/* ============================================================
   RENDER — Punto de entrada de la vista
   ============================================================ */

export async function render(el) {
  container = el;

  container.innerHTML = `
    <div class="animate-fade-in">

      <!-- Topbar -->
      <div class="topbar">
        <h2>Evaluación de Desempeño</h2>
        <button id="btn-nueva-evaluacion" class="btn primary">+ Nueva evaluación</button>
      </div>

      <!-- Selector de empleado -->
      <div class="filters-row">
        <div class="field" style="min-width:280px;">
          <span class="lbl">Empleado</span>
          <select id="select-empleado-eval" class="input">
            <option value="">— Selecciona un empleado —</option>
          </select>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-row" id="kpi-evaluaciones" style="display:none;">
        <div class="box kpi-card">
          <span class="lbl">Última puntuación</span>
          <div class="num" id="kpi-ultima">—</div>
        </div>
        <div class="box kpi-card">
          <span class="lbl">Promedio histórico</span>
          <div class="num" id="kpi-promedio">—</div>
        </div>
        <div class="box kpi-card">
          <span class="lbl">Total evaluaciones</span>
          <div class="num" id="kpi-total">—</div>
        </div>
        <div class="box kpi-card">
          <span class="lbl">Mejor categoría</span>
          <div class="num" id="kpi-mejor" style="font-size:var(--text-lg);">—</div>
        </div>
      </div>

      <!-- Tabla de historial -->
      <div class="box table-scroll-wrapper" style="padding:0;">
        <table class="wf">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Fecha evaluación</th>
              <th>Evaluador</th>
              <th>Puntuación final</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tabla-evaluaciones-body">
            <tr><td colspan="5">
              <div class="tabla-vacia">
                <div class="icono">📋</div>
                <p>Selecciona un empleado para ver su historial de evaluaciones</p>
              </div>
            </td></tr>
          </tbody>
        </table>
      </div>

      <!-- ================================================
           MODAL: Nueva Evaluación
           ================================================ -->
      <div class="modal-overlay" id="modal-nueva-eval">
        <div class="modal-box wide">
          <div class="modal-header">
            <h3>Nueva evaluación de desempeño</h3>
            <button class="modal-close" data-close-modal="modal-nueva-eval">✕</button>
          </div>
          <div class="modal-body">
            <form id="form-evaluacion">

              <!-- Datos generales -->
              <div class="modal-separator">Datos generales</div>
              <div class="form-grid">
                <div class="field">
                  <span class="lbl">Empleado a evaluar</span>
                  <select id="eval-empleado" name="id_empleado" required></select>
                </div>
                <div class="field">
                  <span class="lbl">Evaluador</span>
                  <select id="eval-evaluador" name="id_evaluador" required></select>
                </div>
                <div class="field">
                  <span class="lbl">Inicio del periodo</span>
                  <input type="date" id="eval-periodo-inicio" name="periodo_inicio" required>
                </div>
                <div class="field">
                  <span class="lbl">Fin del periodo</span>
                  <input type="date" id="eval-periodo-fin" name="periodo_fin" required>
                </div>
                <div class="field field-full">
                  <span class="lbl">Fecha de evaluación</span>
                  <input type="date" id="eval-fecha" name="fecha_evaluacion">
                  <span class="field-hint">Dejar vacío para usar la fecha actual</span>
                </div>
              </div>

              <!-- Checklist de categorías -->
              <div class="modal-separator">Checklist por categoría</div>
              <div class="checklist-grid" id="checklist-container">
                <!-- Se llena dinámicamente -->
              </div>

              <!-- Puntuación en tiempo real -->
              <div class="puntuacion-preview" id="puntuacion-preview">
                <div class="preview-header">
                  <span class="preview-label">Puntuación ponderada estimada</span>
                  <span class="preview-score" id="preview-score-val">0.00</span>
                </div>
                <div class="puntuacion-bar-track">
                  <div class="puntuacion-bar-fill" id="preview-bar" style="width:0%;"></div>
                </div>
              </div>

              <!-- Comentarios generales -->
              <div class="modal-separator">Comentarios generales</div>
              <div class="field">
                <textarea id="eval-comentarios" name="comentarios_generales"
                          placeholder="Observaciones generales sobre el desempeño del empleado..."
                          rows="3"></textarea>
              </div>

            </form>
          </div>
          <div class="modal-footer">
            <button class="btn ghost" data-close-modal="modal-nueva-eval">Cancelar</button>
            <button class="btn primary" id="btn-guardar-eval">Guardar evaluación</button>
          </div>
        </div>
      </div>

      <!-- ================================================
           MODAL: Detalle de Evaluación
           ================================================ -->
      <div class="modal-overlay" id="modal-detalle-eval">
        <div class="modal-box wide">
          <div class="modal-header">
            <h3 id="detalle-titulo">Detalle de evaluación</h3>
            <button class="modal-close" data-close-modal="modal-detalle-eval">✕</button>
          </div>
          <div class="modal-body" id="detalle-body">
            <!-- Se llena dinámicamente -->
          </div>
          <div class="modal-footer">
            <button class="btn ghost" data-close-modal="modal-detalle-eval">Cerrar</button>
          </div>
        </div>
      </div>

    </div>
  `;

  // Inicializar botones de cierre de modales
  initModalCloseButtons(container);

  // Bind de eventos
  container.querySelector('#btn-nueva-evaluacion').addEventListener('click', abrirModalNuevaEval);
  container.querySelector('#btn-guardar-eval').addEventListener('click', guardarEvaluacion);
  container.querySelector('#select-empleado-eval').addEventListener('change', onEmpleadoSeleccionado);
  container.querySelector('#tabla-evaluaciones-body').addEventListener('click', handleTablaClick);

  // Validación de periodo en tiempo real
  container.querySelector('#eval-periodo-inicio').addEventListener('change', validarPeriodo);
  container.querySelector('#eval-periodo-fin').addEventListener('change', validarPeriodo);

  // Cargar datos iniciales
  await cargarDatosIniciales();
}

/* ============================================================
   DESTROY — Limpieza al salir de la vista
   ============================================================ */

export function destroy() {
  container = null;
  categorias = [];
  empleados = [];
  historial = [];
}

/* ============================================================
   CARGA DE DATOS INICIALES
   ============================================================ */

async function cargarDatosIniciales() {
  try {
    const [emps, cats] = await Promise.all([
      api.get('/api/empleados?estado=1'),
      api.get('/api/evaluaciones/categorias'),
    ]);

    empleados = emps || [];
    categorias = cats || [];

    // Si no hay categorías, intentar sembrar
    if (categorias.length === 0) {
      try {
        categorias = await api.post('/api/evaluaciones/categorias/sembrar');
        toast.info('Categorías de evaluación inicializadas correctamente');
      } catch {
        toast.warning('No se pudieron sembrar las categorías de evaluación');
      }
    }

    // Llenar selector de empleado en la vista principal
    llenarSelectEmpleados('select-empleado-eval', '— Selecciona un empleado —');

  } catch (err) {
    console.error('Error al cargar datos iniciales:', err);
    toast.error('Error al cargar los datos del módulo de evaluaciones');
  }
}

/**
 * Llena un <select> con la lista de empleados.
 */
function llenarSelectEmpleados(selectId, placeholder) {
  const select = container?.querySelector(`#${selectId}`);
  if (!select) return;

  let html = `<option value="">${escapeHtml(placeholder)}</option>`;
  html += empleados.map(emp => {
    const nombre = getNombreEmpleado(emp);
    const id = emp.ID_Empleado || emp.id_empleado;
    return `<option value="${id}">${escapeHtml(nombre)}</option>`;
  }).join('');

  select.innerHTML = html;
}

/**
 * Extrae el nombre completo del empleado de forma segura.
 */
function getNombreEmpleado(emp) {
  const nombre = emp.Nombre || emp.nombre || '';
  const apellido = emp.Apellido || emp.apellido || '';
  const numero = emp.Numero_Empleado || emp.numero_empleado || '';
  return `${nombre} ${apellido}${numero ? ` (${numero})` : ''}`.trim();
}

/**
 * Busca el nombre de un empleado por ID.
 */
function buscarNombreEmpleado(id) {
  const emp = empleados.find(e => (e.ID_Empleado || e.id_empleado) == id);
  return emp ? getNombreEmpleado(emp) : `Empleado #${id}`;
}

/* ============================================================
   SELECCIÓN DE EMPLEADO — Cargar historial y KPIs
   ============================================================ */

async function onEmpleadoSeleccionado() {
  const select = container?.querySelector('#select-empleado-eval');
  const idEmpleado = select?.value;

  if (!idEmpleado) {
    ocultarHistorial();
    return;
  }

  const tbody = container?.querySelector('#tabla-evaluaciones-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5" class="tabla-vacia"><div class="spinner"></div></td></tr>`;
  }

  try {
    historial = await api.get(`/api/evaluaciones/empleado/${idEmpleado}`);
    renderizarTabla(historial);
    renderizarKpis(historial);
  } catch (err) {
    console.error('Error al cargar historial:', err);
    toast.error('No se pudo cargar el historial de evaluaciones');
    ocultarHistorial();
  }
}

function ocultarHistorial() {
  historial = [];
  const kpiRow = container?.querySelector('#kpi-evaluaciones');
  if (kpiRow) kpiRow.style.display = 'none';

  const tbody = container?.querySelector('#tabla-evaluaciones-body');
  if (tbody) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="tabla-vacia">
          <div class="icono">📋</div>
          <p>Selecciona un empleado para ver su historial de evaluaciones</p>
        </div>
      </td></tr>
    `;
  }
}

/* ============================================================
   KPIs DINÁMICOS
   ============================================================ */

function renderizarKpis(evaluaciones) {
  const kpiRow = container?.querySelector('#kpi-evaluaciones');
  if (!kpiRow) return;

  if (!evaluaciones || evaluaciones.length === 0) {
    kpiRow.style.display = 'none';
    return;
  }

  kpiRow.style.display = '';

  // Última puntuación
  const ultima = parseFloat(evaluaciones[0]?.Puntuacion_Final) || 0;
  setKpi('kpi-ultima', formatScore(ultima));

  // Promedio
  const sum = evaluaciones.reduce((acc, e) => acc + (parseFloat(e.Puntuacion_Final) || 0), 0);
  const promedio = sum / evaluaciones.length;
  setKpi('kpi-promedio', formatScore(promedio));

  // Total
  setKpi('kpi-total', evaluaciones.length);

  // Mejor categoría (promediar puntajes de cada categoría a lo largo de todas las evaluaciones)
  const catTotals = {};
  const catCounts = {};
  for (const ev of evaluaciones) {
    for (const item of (ev.checklist_items || [])) {
      const catId = item.ID_Categoria;
      const nombre = item.categoria?.Nombre || `Cat ${catId}`;
      if (!catTotals[nombre]) {
        catTotals[nombre] = 0;
        catCounts[nombre] = 0;
      }
      catTotals[nombre] += parseFloat(item.Puntaje) || 0;
      catCounts[nombre]++;
    }
  }

  let mejorCat = '—';
  let mejorProm = -1;
  for (const nombre of Object.keys(catTotals)) {
    const avg = catTotals[nombre] / catCounts[nombre];
    if (avg > mejorProm) {
      mejorProm = avg;
      mejorCat = nombre;
    }
  }
  setKpi('kpi-mejor', mejorCat);
}

function setKpi(id, value) {
  const el = container?.querySelector(`#${id}`);
  if (el) el.textContent = value;
}

function formatScore(val) {
  return parseFloat(val).toFixed(2);
}

/* ============================================================
   TABLA DE HISTORIAL
   ============================================================ */

function renderizarTabla(evaluaciones) {
  const tbody = container?.querySelector('#tabla-evaluaciones-body');
  if (!tbody) return;

  if (!evaluaciones || evaluaciones.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="tabla-vacia">
          <div class="icono">📋</div>
          <p>Este empleado no tiene evaluaciones registradas</p>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = evaluaciones.map((ev, idx) => {
    const score = parseFloat(ev.Puntuacion_Final) || 0;
    const rango = getScoreRango(score);
    const evaluador = buscarNombreEmpleado(ev.ID_Evaluador);

    return `
      <tr data-eval-index="${idx}">
        <td>${formatDate(ev.Periodo_Inicio)} — ${formatDate(ev.Periodo_Fin)}</td>
        <td>${formatDate(ev.Fecha_Evaluacion)}</td>
        <td>${escapeHtml(evaluador)}</td>
        <td><span class="score-badge ${rango}">${score.toFixed(2)}</span></td>
        <td class="acciones-cell">
          <span class="tag ver-detalle">Ver detalle</span>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Clasifica un puntaje en un rango de color.
 */
function getScoreRango(score) {
  if (score >= 80) return 'excelente';
  if (score >= 60) return 'bueno';
  return 'mejorar';
}

/**
 * Retorna el texto legible del rango.
 */
function getScoreRangoLabel(score) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  return 'Debe mejorar';
}

/* ============================================================
   MODAL: NUEVA EVALUACIÓN
   ============================================================ */

function abrirModalNuevaEval() {
  const form = container?.querySelector('#form-evaluacion');
  if (form) form.reset();

  // Llenar selects de empleado y evaluador
  llenarSelectEmpleados('eval-empleado', '— Selecciona empleado —');
  llenarSelectEmpleados('eval-evaluador', '— Selecciona evaluador —');

  // Fecha de evaluación por defecto: hoy
  const hoy = new Date().toISOString().split('T')[0];
  const fechaInput = container?.querySelector('#eval-fecha');
  if (fechaInput) fechaInput.value = hoy;

  // Renderizar el checklist dinámico
  renderizarChecklist();

  // Resetear preview de puntuación
  actualizarPreviewPuntuacion();

  openModal('modal-nueva-eval');
}

/**
 * Renderiza el checklist de categorías dinámico en el modal.
 */
function renderizarChecklist() {
  const checklistContainer = container?.querySelector('#checklist-container');
  if (!checklistContainer) return;

  if (!categorias.length) {
    checklistContainer.innerHTML = `
      <div class="stub-view" style="min-height:120px;">
        <p>No hay categorías de evaluación disponibles. Verifica la configuración del backend.</p>
      </div>
    `;
    return;
  }

  checklistContainer.innerHTML = categorias.map(cat => {
    const id = cat.ID_Categoria;
    const nombre = cat.Nombre;
    const peso = parseFloat(cat.Peso_Porcentaje) || 0;

    return `
      <div class="checklist-category" data-cat-id="${id}">
        <div class="cat-info">
          <span class="cat-name">${escapeHtml(nombre)}</span>
          <span class="cat-peso">Peso: <span class="peso-val">${peso}%</span></span>
        </div>
        <div class="puntaje-input-group">
          <input type="number" id="puntaje-${id}" class="puntaje-input"
                 min="0" max="100" step="1" value="0"
                 data-cat-id="${id}" data-peso="${peso}">
          <span class="puntaje-label">/ 100</span>
        </div>
        <div class="cat-obs">
          <textarea id="obs-${id}" placeholder="Observaciones..."
                    data-cat-id="${id}"></textarea>
          <span class="obs-label">Opcional</span>
        </div>
      </div>
    `;
  }).join('');

  // Bind eventos de cambio de puntaje para cálculo en tiempo real
  checklistContainer.querySelectorAll('.puntaje-input').forEach(input => {
    input.addEventListener('input', actualizarPreviewPuntuacion);
  });
}

/**
 * Calcula y muestra la puntuación ponderada en tiempo real.
 */
function actualizarPreviewPuntuacion() {
  let total = 0;
  const inputs = container?.querySelectorAll('.puntaje-input') || [];

  inputs.forEach(input => {
    const puntaje = Math.min(100, Math.max(0, parseFloat(input.value) || 0));
    const peso = parseFloat(input.dataset.peso) || 0;
    const factor = peso > 1 ? peso / 100 : peso;
    total += puntaje * factor;
  });

  total = Math.round(total * 100) / 100;
  const rango = getScoreRango(total);

  // Actualizar número
  const scoreEl = container?.querySelector('#preview-score-val');
  if (scoreEl) {
    scoreEl.textContent = total.toFixed(2);
    scoreEl.className = `preview-score ${rango}`;
  }

  // Actualizar barra
  const barEl = container?.querySelector('#preview-bar');
  if (barEl) {
    barEl.style.width = `${Math.min(100, total)}%`;
    barEl.className = `puntuacion-bar-fill ${rango}`;
  }
}

/**
 * Valida que el periodo sea semestral (170-190 días).
 */
function validarPeriodo() {
  const inicio = container?.querySelector('#eval-periodo-inicio')?.value;
  const fin = container?.querySelector('#eval-periodo-fin')?.value;

  if (!inicio || !fin) return;

  const dias = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24);

  const fieldInicio = container?.querySelector('#eval-periodo-inicio')?.closest('.field');
  const fieldFin = container?.querySelector('#eval-periodo-fin')?.closest('.field');

  // Limpiar errores previos
  fieldInicio?.classList.remove('error');
  fieldFin?.classList.remove('error');

  // Remover hint previo
  const prevHint = fieldFin?.querySelector('.field-hint.dynamic');
  if (prevHint) prevHint.remove();

  if (dias < 170 || dias > 190) {
    fieldFin?.classList.add('error');
    const hint = document.createElement('span');
    hint.className = 'field-hint dynamic';
    hint.textContent = `El periodo debe ser ~6 meses (170-190 días). Actual: ${Math.round(dias)} días`;
    fieldFin?.appendChild(hint);
  } else {
    // Mostrar hint de éxito
    const hint = document.createElement('span');
    hint.className = 'field-hint dynamic';
    hint.style.color = 'var(--success)';
    hint.textContent = `✓ Periodo válido: ${Math.round(dias)} días`;
    fieldFin?.appendChild(hint);
  }
}

/* ============================================================
   GUARDAR EVALUACIÓN
   ============================================================ */

async function guardarEvaluacion() {
  const form = container?.querySelector('#form-evaluacion');
  if (!form || !form.reportValidity()) return;

  const idEmpleado = container?.querySelector('#eval-empleado')?.value;
  const idEvaluador = container?.querySelector('#eval-evaluador')?.value;
  const periodoInicio = container?.querySelector('#eval-periodo-inicio')?.value;
  const periodoFin = container?.querySelector('#eval-periodo-fin')?.value;
  const fechaEvaluacion = container?.querySelector('#eval-fecha')?.value || null;
  const comentarios = container?.querySelector('#eval-comentarios')?.value || null;

  // Validaciones
  if (!idEmpleado) { toast.warning('Selecciona un empleado a evaluar'); return; }
  if (!idEvaluador) { toast.warning('Selecciona un evaluador'); return; }
  if (idEmpleado === idEvaluador) { toast.warning('El evaluador no puede ser el mismo empleado evaluado'); return; }
  if (!periodoInicio || !periodoFin) { toast.warning('Completa las fechas del periodo'); return; }

  // Validar periodo
  const dias = (new Date(periodoFin) - new Date(periodoInicio)) / (1000 * 60 * 60 * 24);
  if (dias < 170 || dias > 190) {
    toast.error(`El periodo debe ser de ~6 meses (170-190 días). Actual: ${Math.round(dias)} días`);
    return;
  }

  // Armar checklist
  const checklist = [];
  let todosConPuntaje = true;

  for (const cat of categorias) {
    const id = cat.ID_Categoria;
    const puntajeInput = container?.querySelector(`#puntaje-${id}`);
    const obsInput = container?.querySelector(`#obs-${id}`);

    const puntaje = parseFloat(puntajeInput?.value) || 0;
    if (puntaje === 0) todosConPuntaje = false;

    checklist.push({
      ID_Categoria: id,
      Puntaje: puntaje,
      Observaciones: obsInput?.value || null,
    });
  }

  if (!todosConPuntaje) {
    toast.warning('Hay categorías con puntaje 0. ¿Estás seguro de que quieres continuar?');
    // No bloqueamos, solo avisamos
  }

  const payload = {
    ID_Empleado: parseInt(idEmpleado),
    ID_Evaluador: parseInt(idEvaluador),
    Periodo_Inicio: periodoInicio,
    Periodo_Fin: periodoFin,
    Comentarios_Generales: comentarios,
    checklist: checklist,
  };

  if (fechaEvaluacion) {
    payload.Fecha_Evaluacion = fechaEvaluacion;
  }

  // Deshabilitar botón mientras se guarda
  const btnGuardar = container?.querySelector('#btn-guardar-eval');
  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';
  }

  try {
    await api.post('/api/evaluaciones/', payload);
    toast.success('Evaluación registrada correctamente');
    closeModal('modal-nueva-eval');

    // Recargar historial si el empleado evaluado es el seleccionado actualmente
    const selectPrincipal = container?.querySelector('#select-empleado-eval');
    if (selectPrincipal?.value === idEmpleado) {
      await onEmpleadoSeleccionado();
    }
  } catch (err) {
    toast.error(err.message || 'No se pudo guardar la evaluación');
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar evaluación';
    }
  }
}

/* ============================================================
   MODAL: DETALLE DE EVALUACIÓN
   ============================================================ */

function abrirDetalle(index) {
  const ev = historial[index];
  if (!ev) return;

  const score = parseFloat(ev.Puntuacion_Final) || 0;
  const rango = getScoreRango(score);
  const rangoLabel = getScoreRangoLabel(score);
  const evaluador = buscarNombreEmpleado(ev.ID_Evaluador);

  const body = container?.querySelector('#detalle-body');
  if (!body) return;

  body.innerHTML = `
    <!-- Puntuación destacada -->
    <div class="detail-score-big">
      <div class="score-number ${rango}">${score.toFixed(2)}</div>
      <div class="score-label">Puntuación Final · ${rangoLabel}</div>
    </div>

    <!-- Info general -->
    <div class="detail-info-grid">
      <div class="detail-info-item">
        <span class="info-label">Periodo</span>
        <span class="info-value">${formatDate(ev.Periodo_Inicio)} — ${formatDate(ev.Periodo_Fin)}</span>
      </div>
      <div class="detail-info-item">
        <span class="info-label">Fecha de evaluación</span>
        <span class="info-value">${formatDate(ev.Fecha_Evaluacion)}</span>
      </div>
      <div class="detail-info-item">
        <span class="info-label">Evaluador</span>
        <span class="info-value">${escapeHtml(evaluador)}</span>
      </div>
      <div class="detail-info-item">
        <span class="info-label">ID Evaluación</span>
        <span class="info-value">#${ev.ID_Evaluacion}</span>
      </div>
    </div>

    <!-- Barras por categoría -->
    <div class="modal-separator">Desglose por categoría</div>
    <div class="detail-bars">
      ${(ev.checklist_items || []).map(item => {
        const puntaje = parseFloat(item.Puntaje) || 0;
        const catNombre = item.categoria?.Nombre || `Categoría ${item.ID_Categoria}`;
        const catPeso = item.categoria?.Peso_Porcentaje ? `${item.categoria.Peso_Porcentaje}%` : '';
        const itemRango = getScoreRango(puntaje);

        return `
          <div class="detail-bar-row">
            <div class="detail-bar-header">
              <span class="detail-bar-name">${escapeHtml(catNombre)} ${catPeso ? `<span style="color:var(--text-muted);font-weight:400;">(${catPeso})</span>` : ''}</span>
              <span class="detail-bar-score ${itemRango}">${puntaje.toFixed(0)}/100</span>
            </div>
            <div class="detail-bar-track">
              <div class="detail-bar-fill ${itemRango}" style="width:${puntaje}%;"></div>
            </div>
            ${item.Observaciones ? `<div class="detail-obs">${escapeHtml(item.Observaciones)}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>

    ${ev.Comentarios_Generales ? `
      <div class="detail-comentarios">
        <div class="com-title">Comentarios generales</div>
        <div class="com-text">${escapeHtml(ev.Comentarios_Generales)}</div>
      </div>
    ` : ''}
  `;

  // Animar las barras después de abrir el modal
  openModal('modal-detalle-eval');

  // Trigger animación de barras con delay
  requestAnimationFrame(() => {
    body.querySelectorAll('.detail-bar-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        bar.style.width = width;
      });
    });
  });
}

/* ============================================================
   DELEGACIÓN DE EVENTOS EN LA TABLA
   ============================================================ */

function handleTablaClick(e) {
  if (e.target.classList.contains('ver-detalle')) {
    const fila = e.target.closest('tr');
    if (!fila) return;
    const index = parseInt(fila.dataset.evalIndex);
    if (!isNaN(index)) {
      abrirDetalle(index);
    }
  }
}
