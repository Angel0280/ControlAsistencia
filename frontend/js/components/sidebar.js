/* ============================================================
   COMPONENTS / SIDEBAR.JS
   Genera el sidebar dinámicamente y maneja la interacción.
   ============================================================ */

import { navigate, getCurrentRoute } from '../router.js';

/**
 * Definición de la navegación del sidebar.
 * Cada grupo tiene un label y un array de items.
 */
const NAV_STRUCTURE = [
  {
    group: 'Principal',
    items: [
      { key: 'dashboard',    label: 'Dashboard',       icon: '📊', route: '#/dashboard' },
      { key: 'empleados',    label: 'Empleados',       icon: '👥', route: '#/empleados' },
      { key: 'asistencia',   label: 'Asistencia',      icon: '⏱️', route: '#/asistencia' },
      { key: 'vacaciones',   label: 'Vacaciones',      icon: '🌴', route: '#/vacaciones' },
      { key: 'contratos',    label: 'Contratos',       icon: '📄', route: '#/contratos' },
    ],
  },
  {
    group: 'Nómina',
    items: [
      { key: 'planilla',     label: 'Planilla',        icon: '💰', route: '#/planilla' },
      { key: 'evaluaciones', label: 'Evaluaciones',    icon: '📋', route: '#/evaluaciones' },
    ],
  },
  {
    group: 'Catálogos',
    items: [
      { key: 'departamentos',   label: 'Departamentos',    icon: '🏢', route: '#/departamentos' },
      { key: 'ubicaciones',      label: 'Ubicaciones',      icon: '📍', route: '#/ubicaciones' },
      { key: 'roles',            label: 'Roles',            icon: '🔑', route: '#/roles' },
      { key: 'permisos',         label: 'Permisos',         icon: '🛡️', route: '#/permisos' },
      { key: 'tipos-deduccion',  label: 'Tipos Deducción',  icon: '📝', route: '#/tipos-deduccion' },
    ],
  },
];

/**
 * Renderiza el sidebar completo dentro del contenedor.
 */
export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const currentRoute = '#' + (getCurrentRoute() || '/dashboard');

  let html = `
    <div class="sidebar-brand">
      <img src="assets/walmartlogo.webp" alt="Logo">
      <div class="app-name">Control de Asistencia</div>
    </div>
    <nav class="sidebar-nav">
  `;

  for (const group of NAV_STRUCTURE) {
    html += `<div class="nav-group-label">${group.group}</div>`;

    for (const item of group.items) {
      const isActive = currentRoute === item.route ? ' active' : '';
      html += `
        <div class="nav-item${isActive}" data-route="${item.route}" data-key="${item.key}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </div>
      `;
    }
  }

  html += `</nav>`;

  html += `
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">A</div>
        <span>Administrador</span>
      </div>
    </div>
  `;

  sidebar.innerHTML = html;

  // Bind de clics en nav-items
  sidebar.addEventListener('click', handleNavClick);

  // Mobile: cerrar sidebar al hacer clic en overlay
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  // Mobile: abrir sidebar
  const menuBtn = document.getElementById('btn-menu-mobile');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMobileSidebar);
  }
}

/**
 * Maneja clic en un item de navegación.
 * @param {Event} e
 */
function handleNavClick(e) {
  const navItem = e.target.closest('.nav-item');
  if (!navItem || navItem.classList.contains('dim')) return;

  const route = navItem.getAttribute('data-route');
  if (!route) return;

  // Extraer la ruta sin el #
  const path = route.slice(1);
  navigate(path);

  // Cerrar sidebar en mobile
  closeMobileSidebar();
}

/**
 * Abre/cierra el sidebar en mobile.
 */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('visible');
}

/**
 * Cierra el sidebar en mobile.
 */
function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('visible');
}

/**
 * Actualiza qué item del sidebar está marcado como activo.
 * Llamado por el router al cambiar de ruta.
 * @param {string} route - Ruta con # (ej: '#/empleados')
 */
export function setActiveNavItem(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const itemRoute = item.getAttribute('data-route');
    item.classList.toggle('active', itemRoute === route);
  });
}
