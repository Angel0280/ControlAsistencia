/* ============================================================
   ASISTENCIA
   Maneja los botones "Marcar entrada" / "Marcar salida".
   Aquí solo va el comportamiento del FRONTEND; el guardado real
   en la tabla Asistencia (Hora_Entrada, Hora_Salida, ID_Ubicacion,
   IP_Marcaje) lo hace el backend (app/) vía API.
   ============================================================ */

async function marcarAsistencia(tipo){
  // tipo: "entrada" | "salida"
  const idEmpleado = document.body.dataset.idEmpleado; // inyectado por el backend al renderizar

  const payload = {
    id_empleado: idEmpleado,
    tipo: tipo,
    // La IP real se obtiene en el backend a partir del request,
    // no se debe confiar en el frontend para este dato.
  };

  try{
    const resp = await fetch(window.apiUrl("/api/asistencia/marcar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if(!resp.ok) throw new Error("Error al registrar marcaje");

    const data = await resp.json();
    actualizarEstadoDelDia(data);
  }catch(err){
    console.error(err);
    alert("No se pudo registrar el marcaje. Intenta de nuevo.");
  }
}

function actualizarEstadoDelDia(data){
  const estadoEl = document.querySelector(".meta-chip.estado-dia");
  if (estadoEl) estadoEl.textContent = `Estado del día: ${data.estado}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnEntrada = document.getElementById("btn-marcar-entrada");
  const btnSalida  = document.getElementById("btn-marcar-salida");

  if (btnEntrada) btnEntrada.addEventListener("click", () => marcarAsistencia("entrada"));
  if (btnSalida)  btnSalida.addEventListener("click", () => marcarAsistencia("salida"));
});
