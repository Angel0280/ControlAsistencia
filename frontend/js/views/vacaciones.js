/* ============================================================
   VIEWS / VACACIONES.JS
   Vista stub — Módulo de Gestión de Vacaciones.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Gestión de Vacaciones</h2>
        <button class="btn primary" disabled>+ Nueva solicitud</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">🌴</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás gestionar las solicitudes de vacaciones,
          consultar el historial y ver los días disponibles de cada empleado.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
