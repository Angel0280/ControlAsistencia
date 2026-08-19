/* ============================================================
   VIEWS / EMPLEADOS.JS
   Vista completa del módulo Empleados.
   - Listar con filtros (estado, búsqueda)
   - Agregar / Editar vía modal
   - Dar de baja / Reactivar vía modal de confirmación
   ============================================================ */

import { api } from '../api.js';
import { toast } from '../toast.js';
import { debounce, fillSelect, escapeHtml, formatMoney } from '../utils.js';
import { openModal, closeModal, initModalCloseButtons } from '../components/modal.js';

/** Estado local de la vista */
let empleadoIdBaja = null;
let container = null;

/* ============================================================
   RENDER — Punto de entrada de la vista
   ============================================================ */

export async function render(el) {
  container = el;

  container.innerHTML = `
    <div class="animate-fade-in">

      <!-- Topbar -->
      <div class="topbar">
        <h2>Empleados</h2>
        <button id="btn-agregar-empleado" class="btn primary">+ Agregar empleado</button>
      </div>

      <!-- Filtros -->
      <div class="filters-row">
        <div class="field" style="min-width:220px;">
          <span class="lbl">Buscar</span>
          <input id="buscar-empleado" type="text" class="input"
                 placeholder="Nombre, número o INSS">
        </div>
        <div class="field">
          <span class="lbl">Estado</span>
          <select id="filtro-estado-empleado" class="input">
            <option value="">Todos</option>
            <option value="1" selected>Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="box table-scroll-wrapper" style="padding:0;">
        <table class="wf">
          <thead>
            <tr>
              <th>Nro. Empleado</th>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Rol</th>
              <th>Ubicación</th>
              <th>Salario base</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tabla-empleados-body">
            <tr><td colspan="8" class="tabla-vacia">
              <div class="spinner"></div>
            </td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal: Agregar/Editar empleado -->
      <div class="modal-overlay" id="modal-empleado">
        <div class="modal-box">
          <div class="modal-header">
            <h3 id="modal-empleado-titulo">Agregar empleado</h3>
            <button class="modal-close" data-close-modal="modal-empleado">✕</button>
          </div>
          <div class="modal-body">
            <form id="form-empleado">
              <input type="hidden" id="emp-id" name="id_empleado">
              <div class="form-grid">
                <div class="field">
                  <span class="lbl">Número de empleado</span>
                  <input type="text" id="emp-numero" name="numero_empleado" placeholder="EMP-0011" required>
                </div>
                <div class="field">
                  <span class="lbl">INSS</span>
                  <input type="text" id="emp-inss" name="inss" placeholder="INSS-0011" required>
                </div>
                <div class="field">
                  <span class="lbl">Nombre</span>
                  <input type="text" id="emp-nombre" name="nombre" required>
                </div>
                <div class="field">
                  <span class="lbl">Apellido</span>
                  <input type="text" id="emp-apellido" name="apellido" required>
                </div>
                <div class="field">
                  <span class="lbl">Fecha de contratación</span>
                  <input type="date" id="emp-fecha" name="fecha_contratacion" required>
                </div>
                <div class="field">
                  <span class="lbl">Salario base (C$)</span>
                  <input type="number" id="emp-salario" name="salario_base" step="0.01" min="0" required>
                </div>
                <div class="field">
                  <span class="lbl">Departamento</span>
                  <select id="emp-departamento" name="id_departamento" required></select>
                </div>
                <div class="field">
                  <span class="lbl">Rol</span>
                  <select id="emp-rol" name="id_rol" required></select>
                </div>
                <div class="field field-full">
                  <span class="lbl">Ubicación</span>
                  <select id="emp-ubicacion" name="id_ubicacion" required></select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn ghost" data-close-modal="modal-empleado">Cancelar</button>
            <button class="btn primary" id="btn-guardar-empleado">Guardar empleado</button>
          </div>
        </div>
      </div>

      <!-- Modal: Confirmar baja/reactivación -->
      <div class="modal-overlay" id="modal-confirmar">
        <div class="modal-box confirm">
          <div class="modal-header">
            <h3 id="modal-confirmar-titulo">Dar de baja a empleado</h3>
            <button class="modal-close" data-close-modal="modal-confirmar">✕</button>
          </div>
          <div class="modal-body">
            <p class="confirm-text" id="modal-confirmar-texto"></p>
          </div>
          <div class="modal-footer">
            <button class="btn ghost" data-close-modal="modal-confirmar">Cancelar</button>
            <button class="btn primary" id="btn-confirmar-baja">Confirmar</button>
          </div>
        </div>
      </div>

    </div>
  `;

  // Inicializar botones de cierre de modales
  initModalCloseButtons(container);

  // Bind de eventos
  container.querySelector('#btn-agregar-empleado').addEventListener('click', () => abrirModalEmpleado());
  container.querySelector('#btn-guardar-empleado').addEventListener('click', guardarEmpleado);
  container.querySelector('#btn-confirmar-baja').addEventListener('click', confirmarCambioEstado);
  container.querySelector('#filtro-estado-empleado').addEventListener('change', cargarEmpleados);
  container.querySelector('#buscar-empleado').addEventListener('input', debounce(cargarEmpleados, 350));

  // Delegación para acciones en la tabla
  container.querySelector('#tabla-empleados-body').addEventListener('click', handleTablaClick);

  // Cargar datos iniciales
  await Promise.all([cargarCatalogos(), cargarEmpleados()]);
}

/* ============================================================
   DESTROY — Limpieza al salir de la vista
   ============================================================ */

export function destroy() {
  container = null;
  empleadoIdBaja = null;
}

/* ============================================================
   LISTAR EMPLEADOS
   ============================================================ */

async function cargarEmpleados() {
  const estado = container.querySelector('#filtro-estado-empleado').value;
  const busqueda = container.querySelector('#buscar-empleado').value;

  const params = new URLSearchParams();
  if (estado !== '') params.set('estado', estado);
  if (busqueda) params.set('q', busqueda);

  try {
    const empleados = await api.get(`/api/empleados?${params.toString()}`);
    renderizarTabla(empleados);
  } catch (err) {
    console.error(err);
    toast.error('Error al cargar los empleados');
  }
}

function renderizarTabla(empleados) {
  const tbody = container.querySelector('#tabla-empleados-body');
  if (!tbody) return;

  if (!empleados.length) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="tabla-vacia">
          <div class="icono">👥</div>
          <p>No se encontraron empleados</p>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = empleados.map(emp => `
    <tr data-id-empleado="${emp.id_empleado}" data-nombre="${escapeHtml(emp.nombre + ' ' + emp.apellido)}">
      <td>${escapeHtml(emp.numero_empleado)}</td>
      <td><strong>${escapeHtml(emp.nombre)} ${escapeHtml(emp.apellido)}</strong></td>
      <td>${escapeHtml(emp.departamento || '—')}</td>
      <td>${escapeHtml(emp.rol || '—')}</td>
      <td>${escapeHtml(emp.ubicacion || '—')}</td>
      <td>${formatMoney(emp.salario_base)}</td>
      <td>
        ${emp.estado
          ? '<span class="tag activo">Activo</span>'
          : '<span class="tag inactivo">Inactivo</span>'}
      </td>
      <td class="acciones-cell">
        <span class="tag accion-editar">Editar</span>
        ${emp.estado
          ? '<span class="tag accion-baja">Dar de baja</span>'
          : '<span class="tag accion-reactivar">Reactivar</span>'}
      </td>
    </tr>
  `).join('');
}

/* ============================================================
   CATÁLOGOS (para los <select> del modal)
   ============================================================ */

async function cargarCatalogos() {
  try {
    const data = await api.get('/api/catalogos');
    fillSelect('emp-departamento', data.departamentos || [], 'id_departamento', 'nombre');
    fillSelect('emp-rol', data.roles || [], 'id_rol', 'nombre_rol');
    fillSelect('emp-ubicacion', data.ubicaciones || [], 'id_ubicacion', 'nombre');
  } catch (err) {
    console.error('Error al cargar catálogos:', err);
  }
}

/* ============================================================
   AGREGAR / EDITAR
   ============================================================ */

async function abrirModalEmpleado(idEmpleado = null) {
  const form = container.querySelector('#form-empleado');
  const titulo = container.querySelector('#modal-empleado-titulo');

  form.reset();
  container.querySelector('#emp-id').value = '';

  if (idEmpleado) {
    titulo.textContent = 'Editar empleado';
    try {
      const emp = await api.get(`/api/empleados/${idEmpleado}`);
      container.querySelector('#emp-id').value = emp.id_empleado;
      container.querySelector('#emp-numero').value = emp.numero_empleado;
      container.querySelector('#emp-inss').value = emp.inss;
      container.querySelector('#emp-nombre').value = emp.nombre;
      container.querySelector('#emp-apellido').value = emp.apellido;
      container.querySelector('#emp-fecha').value = emp.fecha_contratacion;
      container.querySelector('#emp-salario').value = emp.salario_base;
      container.querySelector('#emp-departamento').value = emp.id_departamento;
      container.querySelector('#emp-rol').value = emp.id_rol;
      container.querySelector('#emp-ubicacion').value = emp.id_ubicacion;
    } catch (err) {
      toast.error('No se pudo cargar la información del empleado');
      return;
    }
  } else {
    titulo.textContent = 'Agregar empleado';
  }

  openModal('modal-empleado');
}

async function guardarEmpleado() {
  const form = container.querySelector('#form-empleado');
  if (!form.reportValidity()) return;

  const idEmpleado = container.querySelector('#emp-id').value;
  const payload = {
    numero_empleado: container.querySelector('#emp-numero').value,
    inss: container.querySelector('#emp-inss').value,
    nombre: container.querySelector('#emp-nombre').value,
    apellido: container.querySelector('#emp-apellido').value,
    fecha_contratacion: container.querySelector('#emp-fecha').value,
    salario_base: parseFloat(container.querySelector('#emp-salario').value),
    id_departamento: parseInt(container.querySelector('#emp-departamento').value),
    id_rol: parseInt(container.querySelector('#emp-rol').value),
    id_ubicacion: parseInt(container.querySelector('#emp-ubicacion').value),
  };

  try {
    if (idEmpleado) {
      await api.put(`/api/empleados/${idEmpleado}`, payload);
      toast.success('Empleado actualizado correctamente');
    } else {
      await api.post('/api/empleados', payload);
      toast.success('Empleado creado correctamente');
    }

    closeModal('modal-empleado');
    await cargarEmpleados();
  } catch (err) {
    toast.error(err.message || 'No se pudo guardar el empleado');
  }
}

/* ============================================================
   DAR DE BAJA / REACTIVAR
   ============================================================ */

function abrirModalConfirmarBaja(idEmpleado, nombre, accion) {
  empleadoIdBaja = { id: idEmpleado, accion };

  const titulo = container.querySelector('#modal-confirmar-titulo');
  const texto = container.querySelector('#modal-confirmar-texto');
  const btnConfirmar = container.querySelector('#btn-confirmar-baja');

  if (accion === 'baja') {
    titulo.textContent = 'Dar de baja a empleado';
    texto.innerHTML = `¿Confirmas dar de baja a <b>${escapeHtml(nombre)}</b>? Pasará a estado inactivo, pero su historial se conserva.`;
    btnConfirmar.className = 'btn danger';
    btnConfirmar.textContent = 'Dar de baja';
  } else {
    titulo.textContent = 'Reactivar empleado';
    texto.innerHTML = `¿Confirmas reactivar a <b>${escapeHtml(nombre)}</b>? Volverá a aparecer como empleado activo.`;
    btnConfirmar.className = 'btn success';
    btnConfirmar.textContent = 'Reactivar';
  }

  openModal('modal-confirmar');
}

async function confirmarCambioEstado() {
  if (!empleadoIdBaja) return;

  const { id, accion } = empleadoIdBaja;
  const nuevoEstado = accion === 'baja' ? 0 : 1;

  try {
    await api.patch(`/api/empleados/${id}/estado`, { estado: nuevoEstado });

    closeModal('modal-confirmar');
    toast.success(accion === 'baja' ? 'Empleado dado de baja' : 'Empleado reactivado');
    await cargarEmpleados();
  } catch (err) {
    toast.error('No se pudo actualizar el estado del empleado');
  } finally {
    empleadoIdBaja = null;
  }
}

/* ============================================================
   DELEGACIÓN DE EVENTOS EN LA TABLA
   ============================================================ */

function handleTablaClick(e) {
  const fila = e.target.closest('tr');
  if (!fila) return;

  const id = fila.dataset.idEmpleado;
  const nombre = fila.dataset.nombre;

  if (e.target.classList.contains('accion-editar')) {
    abrirModalEmpleado(id);
  }
  if (e.target.classList.contains('accion-baja')) {
    abrirModalConfirmarBaja(id, nombre, 'baja');
  }
  if (e.target.classList.contains('accion-reactivar')) {
    abrirModalConfirmarBaja(id, nombre, 'reactivar');
  }
}
