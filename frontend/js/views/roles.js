/* ============================================================
   VIEWS / ROLES.JS
   Vista stub — Catálogo de Roles.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Roles</h2>
        <button class="btn primary" disabled>+ Nuevo rol</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">🔑</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás administrar los roles del sistema,
          definir responsabilidades y asignar permisos a cada rol.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
