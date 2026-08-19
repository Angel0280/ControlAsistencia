/* ============================================================
   INCLUIR COMPONENTES
   Como las páginas son HTML plano (no un framework con
   componentes), este script busca cualquier elemento con
   data-include="ruta/al/parcial.html" y lo reemplaza por el
   contenido de ese archivo. Así el sidebar (y otros parciales
   de pages/components) se escriben una sola vez.

   Uso en cada página:
   <div data-include="components/sidebar.html"></div>
   <script src="../js/incluir-componentes.js"></script>
   ============================================================ */
async function incluirComponentes(){
  const nodos = document.querySelectorAll("[data-include]");

  for (const nodo of nodos){
    const ruta = nodo.getAttribute("data-include");
    try{
      const resp = await fetch(ruta);
      nodo.innerHTML = await resp.text();
    }catch(err){
      console.error("No se pudo cargar el componente:", ruta, err);
    }
  }

  marcarNavActivo();

  // Avisa al resto de los scripts que los parciales (sidebar, modales, etc.)
  // ya están en el DOM y es seguro buscarlos con getElementById.
  document.dispatchEvent(new Event("includes:listos"));
}

function marcarNavActivo(){
  const pagina = document.body.getAttribute("data-page"); // "asistencia" | "planilla"
  const item = document.querySelector(`.nav-item[data-nav="${pagina}"]`);
  if (item) item.classList.add("active");
}

document.addEventListener("DOMContentLoaded", incluirComponentes);
