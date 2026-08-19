

import { navigate } from '../router.js';

const MODULES = [
  { icon: '👥', title: 'Empleados', desc: 'Gestión de personal, altas y bajas', route: '/empleados' },
  { icon: '⏱️', title: 'Asistencia', desc: 'Marcaje de entradas y salidas', route: '/asistencia' },
  { icon: '🌴', title: 'Vacaciones', desc: 'Solicitudes y días disponibles', route: '/vacaciones' },
  { icon: '📄', title: 'Contratos', desc: 'Registro y gestión de contratos', route: '/contratos' },
  { icon: '💰', title: 'Planilla', desc: 'Generación de nómina y deducciones', route: '/planilla' },
  { icon: '📋', title: 'Evaluaciones', desc: 'Evaluación semestral de desempeño', route: '/evaluaciones' },
  { icon: '🏢', title: 'Departamentos', desc: 'Catálogo de departamentos', route: '/departamentos' },
  { icon: '📍', title: 'Ubicaciones', desc: 'Catálogo de ubicaciones físicas', route: '/ubicaciones' },
  { icon: '🔑', title: 'Roles', desc: 'Catálogo de roles del sistema', route: '/roles' },
  { icon: '🛡️', title: 'Permisos', desc: 'Catálogo de permisos por módulo', route: '/permisos' },
  { icon: '📝', title: 'Tipos de Deducción', desc: 'Catálogo de deducciones de planilla', route: '/tipos-deduccion' },
];

/**
 * Renderiza el dashboard en el contenedor.
 * @param {HTMLElement} container
 */
export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Dashboard</h2>
        <span class="pill">Sistema RRHH v1.0</span>
      </div>

      <div class="dashboard-grid">
        ${MODULES.map(m => `
          <div class="box dashboard-card" data-route="${m.route}">
            <div class="card-icon">${m.icon}</div>
            <h3>${m.title}</h3>
            <p>${m.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;


  container.addEventListener('click', handleCardClick);
}


export function destroy() {
}


function handleCardClick(e) {
  const card = e.target.closest('.dashboard-card');
  if (!card) return;

  const route = card.getAttribute('data-route');
  if (route) navigate(route);
}
