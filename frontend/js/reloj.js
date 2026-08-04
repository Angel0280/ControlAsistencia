/* ============================================================
   RELOJ EN VIVO
   Actualiza la hora mostrada en la tarjeta de marcaje
   (pages/asistencia-marcaje.html -> #clock-time / #clock-date)
   ============================================================ */
function actualizarReloj(){
  const ahora = new Date();

  const horaEl = document.getElementById("clock-time");
  const fechaEl = document.getElementById("clock-date");

  if (horaEl){
    horaEl.textContent = ahora.toLocaleTimeString("es-NI", {
      hour: "2-digit", minute: "2-digit", second:"2-digit"
    });
  }

  if (fechaEl){
    fechaEl.textContent = ahora.toLocaleDateString("es-NI", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    });
  }
}

setInterval(actualizarReloj, 1000);
document.addEventListener("DOMContentLoaded", actualizarReloj);
