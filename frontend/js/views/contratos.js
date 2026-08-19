/* ============================================================
   VIEWS / CONTRATOS.JS
   Vista stub — Módulo de Gestión de Contratos.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Gestión de Contratos</h2>
        <button class="btn primary" disabled>+ Nuevo contrato</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">📄</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás registrar y gestionar los contratos de cada empleado,
          incluyendo tipo, fechas, salario pactado y documento adjunto.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
