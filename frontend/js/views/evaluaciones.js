/* ============================================================
   VIEWS / EVALUACIONES.JS
   Vista stub — Módulo de Evaluación de Desempeño.
   ============================================================ */

export function render(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="topbar">
        <h2>Evaluación de Desempeño</h2>
        <button class="btn primary" disabled>+ Nueva evaluación</button>
      </div>
      <div class="stub-view">
        <div class="stub-icon">📋</div>
        <h2>Módulo en construcción</h2>
        <p>
          Aquí podrás realizar evaluaciones semestrales con checklist por categoría,
          ponderación de puntajes y comentarios generales por empleado.
        </p>
      </div>
    </div>
  `;
}

export function destroy() {}
