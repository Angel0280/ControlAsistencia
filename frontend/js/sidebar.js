/* ============================================================
   SIDEBAR
   Navegación entre páginas al hacer clic en cada item del menú.
   Se activa después de "includes:listos" porque el sidebar se
   inyecta de forma asíncrona (ver js/incluir-componentes.js).
   ============================================================ */

const RUTAS_NAV = {
  asistencia: "asistencia-admin.html",
  empleados:  "empleado.html",
  planilla:   "planilla.html",
  // Vacaciones, Contratos y Reportes quedan pendientes:
  // cuando existan sus páginas, solo se agregan aquí.
};

document.addEventListener("includes:listos", () => {
  const items = document.querySelectorAll(".nav-item[data-nav]");

  items.forEach(item => {
    item.addEventListener("click", () => {
      const clave = item.getAttribute("data-nav");
      const destino = RUTAS_NAV[clave];

      if (!destino){
        console.warn("Esta sección aún no tiene página:", clave);
        return;
      }

      // Evita recargar si ya estamos en esa página
      if (document.body.dataset.page === clave) return;

      window.location.href = destino;
    });
  });

  // Marca el item activo según data-page del body
  const page = document.body.dataset.page;
  if (page){
    const activo = document.querySelector(`.nav-item[data-nav="${page}"]`);
    if (activo) activo.classList.add("active");
  }
});