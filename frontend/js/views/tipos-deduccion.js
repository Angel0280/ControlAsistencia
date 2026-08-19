/* ============================================================
   VIEWS / TIPOS-DEDUCCION.JS
   Vista stub — Catálogo de Tipos de Deducción.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Tipos de Deducción</h2>
        <button class="btn primary" disabled>+ Nuevo tipo</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">📝</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás administrar los tipos de deducción de planilla:
          INSS, IR, préstamos y otras deducciones obligatorias o voluntarias.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
