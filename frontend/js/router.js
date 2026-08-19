/* ============================================================
   ROUTER.JS
   Router SPA basado en hash (#/ruta).
   Escucha hashchange y despacha la vista correspondiente.
   ============================================================ */

/**
 * @typedef {Object} RouteConfig
 * @property {string}   path     - Ruta hash (ej: '/empleados')
 * @property {string}   label    - Nombre legible para breadcrumb
 * @property {Function} view     - Función que retorna el módulo de vista { render, destroy }
 */

/** @type {RouteConfig[]} */
let routes = [];

/** Vista actualmente montada (para llamar destroy antes de cambiar) */
let currentView = null;

/** Nombre de la ruta actual */
let currentPath = '';

/**
 * Registra las rutas de la aplicación.
 * @param {RouteConfig[]} routeList
 */
export function registerRoutes(routeList) {
  routes = routeList;
}

/**
 * Navega a una ruta programáticamente.
 * @param {string} path - Ruta sin # (ej: '/empleados')
 */
export function navigate(path) {
  window.location.hash = '#' + path;
}

/**
 * Retorna la ruta actual (sin el #).
 * @returns {string}
 */
export function getCurrentRoute() {
  return currentPath;
}

/**
 * Inicializa el router: escucha hashchange y carga la ruta inicial.
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange(); // Cargar la ruta actual al iniciar
}

/**
 * Maneja el cambio de ruta.
 * 1. Destruye la vista actual (si tiene destroy()).
 * 2. Busca la ruta en el registro.
 * 3. Renderiza la nueva vista.
 * 4. Actualiza breadcrumb y sidebar activo.
 */
async function handleRouteChange() {
  const hash = window.location.hash.slice(1) || '/dashboard'; // Default
  currentPath = hash;

  // Buscar la ruta que coincide
  const route = routes.find(r => r.path === hash);

  const container = document.getElementById('app-content');
  if (!container) return;

  // 1. Destruir la vista anterior
  if (currentView && typeof currentView.destroy === 'function') {
    currentView.destroy();
  }
  currentView = null;

  // 2. Si no hay ruta, mostrar 404
  if (!route) {
    container.innerHTML = `
      <div class="stub-view animate-fade-in">
        <div class="stub-icon">🔍</div>
        <h2>Página no encontrada</h2>
        <p>La ruta <code>${hash}</code> no existe. Usa el menú lateral para navegar.</p>
      </div>
    `;
    updateBreadcrumb('No encontrado');
    updateActiveNav('');
    return;
  }

  // 3. Mostrar loading mientras carga la vista
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner lg"></div>
      <span>Cargando...</span>
    </div>
  `;

  try {
    // 4. Obtener el módulo de vista
    const viewModule = await route.view();

    // 5. Renderizar la vista
    if (typeof viewModule.render === 'function') {
      await viewModule.render(container);
      currentView = viewModule;
    }

    // 6. Actualizar UI
    updateBreadcrumb(route.label);
    updateActiveNav(route.path);

    // 7. Scroll al inicio
    container.scrollTop = 0;

  } catch (error) {
    console.error('Error al cargar la vista:', error);
    container.innerHTML = `
      <div class="stub-view animate-fade-in">
        <div class="stub-icon">⚠️</div>
        <h2>Error al cargar</h2>
        <p>No se pudo cargar esta sección. Intenta de nuevo.</p>
      </div>
    `;
  }
}

/**
 * Actualiza el texto del breadcrumb.
 * @param {string} label
 */
function updateBreadcrumb(label) {
  const el = document.getElementById('breadcrumb-current');
  if (el) el.textContent = label;
}

/**
 * Marca el nav-item activo en el sidebar.
 * @param {string} path - Ruta activa (ej: '/empleados')
 */
function updateActiveNav(path) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const itemRoute = item.getAttribute('data-route');
    if (itemRoute === '#' + path) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
