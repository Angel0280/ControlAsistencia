/* ============================================================
   PLANILLA
   Maneja "Generar planilla del período" y el detalle de
   deducciones al seleccionar un empleado en la tabla.
   ============================================================ */

async function generarPlanilla(){
  const mes = document.getElementById("filtro-mes").value;
  const anio = document.getElementById("filtro-anio").value;
  const quincena = document.getElementById("filtro-quincena").value;

  try{
    const resp = await fetch(window.apiUrl("/api/planilla/generar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mes, anio, quincena })
    });

    if(!resp.ok) throw new Error("Error al generar la planilla");

    const data = await resp.json();
    renderizarTablaPlanilla(data.detalle);
    renderizarKpis(data.totales);
  }catch(err){
    console.error(err);
    alert("No se pudo generar la planilla.");
  }
}

function renderizarKpis(totales){
  document.getElementById("kpi-empleados").textContent = totales.total_empleados;
  document.getElementById("kpi-bruto").textContent = `C$ ${totales.bruto}`;
  document.getElementById("kpi-deducciones").textContent = `C$ ${totales.deducciones}`;
  document.getElementById("kpi-neto").textContent = `C$ ${totales.neto}`;
}

function renderizarTablaPlanilla(filas){
  const tbody = document.getElementById("tabla-planilla-body");
  if (!tbody) return;

  tbody.innerHTML = filas.map(fila => `
    <tr data-id-empleado="${fila.id_empleado}">
      <td>${fila.nombre}</td>
      <td>${fila.bruto}</td>
      <td>${fila.horas_extra}</td>
      <td>${fila.ausencias}</td>
      <td>${fila.deducciones}</td>
      <td><b>${fila.neto}</b></td>
      <td><span class="tag ver-detalle">Ver detalle</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const btnGenerar = document.getElementById("btn-generar-planilla");
  if (btnGenerar) btnGenerar.addEventListener("click", generarPlanilla);

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("ver-detalle")){
      const fila = e.target.closest("tr");
      cargarDetalleDeducciones(fila.dataset.idEmpleado);
    }
  });
});

async function cargarDetalleDeducciones(idEmpleado){
  const resp = await fetch(window.apiUrl(`/api/planilla/deducciones/${idEmpleado}`));
  const data = await resp.json();
  // Aquí se pinta el panel lateral de "Detalle de deducciones"
  console.log("Deducciones de", idEmpleado, data);
}
