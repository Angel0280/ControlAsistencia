/* ============================================================
   APP.JS
   Bootstrap de la aplicación SPA.
   Inicializa sidebar, router, reloj y registra todas las rutas.
   ============================================================ */

import { registerRoutes, initRouter } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { getCurrentTime } from './utils.js';

/* ── Registrar todas las rutas ── */
registerRoutes([
  {
    path: '/dashboard',
    label: 'Dashboard',
    view: () => import('./views/dashboard.js'),
  },
  {
    path: '/empleados',
    label: 'Empleados',
    view: () => import('./views/empleados.js'),
  },
  {
    path: '/asistencia',
    label: 'Asistencia',
    view: () => import('./views/asistencia.js'),
  },
  {
    path: '/planilla',
    label: 'Planilla',
    view: () => import('./views/planilla.js'),
  },
  {
    path: '/vacaciones',
    label: 'Vacaciones',
    view: () => import('./views/vacaciones.js'),
  },
  {
    path: '/contratos',
    label: 'Contratos',
    view: () => import('./views/contratos.js'),
  },
  {
    path: '/evaluaciones',
    label: 'Evaluaciones',
    view: () => import('./views/evaluaciones.js'),
  },
  {
    path: '/departamentos',
    label: 'Departamentos',
    view: () => import('./views/departamentos.js'),
  },
  {
    path: '/ubicaciones',
    label: 'Ubicaciones',
    view: () => import('./views/ubicaciones.js'),
  },
  {
    path: '/roles',
    label: 'Roles',
    view: () => import('./views/roles.js'),
  },
  {
    path: '/permisos',
    label: 'Permisos',
    view: () => import('./views/permisos.js'),
  },
  {
    path: '/tipos-deduccion',
    label: 'Tipos de Deducción',
    view: () => import('./views/tipos-deduccion.js'),
  },
]);

/* ── Inicializar la aplicación ── */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Renderizar el sidebar
  renderSidebar();

  // 2. Iniciar el router (carga la ruta actual)
  initRouter();

  // 3. Reloj en el header
  updateClock();
  setInterval(updateClock, 1000);
});

/**
 * Actualiza el reloj del header.
 */
function updateClock() {
  const el = document.getElementById('header-clock');
  if (el) el.textContent = getCurrentTime();
}
