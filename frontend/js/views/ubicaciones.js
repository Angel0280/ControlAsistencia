/* ============================================================
   VIEWS / UBICACIONES.JS
   Vista stub — Catálogo de Ubicaciones.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Ubicaciones</h2>
        <button class="btn primary" disabled>+ Nueva ubicación</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">📍</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás administrar el catálogo de ubicaciones físicas
          donde los empleados registran su asistencia.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
