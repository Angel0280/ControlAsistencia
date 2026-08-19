/* ============================================================
   VIEWS / DEPARTAMENTOS.JS
   Vista stub — Catálogo de Departamentos.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Departamentos</h2>
        <button class="btn primary" disabled>+ Nuevo departamento</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">🏢</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás administrar el catálogo de departamentos:
          crear, editar, activar e inactivar departamentos.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
