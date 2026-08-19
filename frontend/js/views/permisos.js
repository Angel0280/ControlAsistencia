/* ============================================================
   VIEWS / PERMISOS.JS
   Vista stub — Catálogo de Permisos.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Permisos</h2>
        <button class="btn primary" disabled>+ Nuevo permiso</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">🛡️</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás administrar los permisos del sistema
          organizados por módulo y asignarlos a roles.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
