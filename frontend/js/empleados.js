/* ============================================================
   EMPLEADOS
   - Obtener empleados con su información (departamento, rol, ubicación)
   - Agregar empleado nuevo
   - Editar empleado
   - Dar de baja / reactivar (cambia Estado, no borra el registro)
   ============================================================ */

let empleadoIdBaja = null; // guarda temporalmente a quién se le está cambiando el estado

// Espera a que sidebar/modales (cargados vía data-include) existan en el DOM
document.addEventListener("includes:listos", () => {
  cargarCatalogos();
  cargarEmpleados();

  document.getElementById("btn-agregar-empleado")
    .addEventListener("click", () => abrirModalEmpleado());

  document.getElementById("btn-guardar-empleado")
    .addEventListener("click", guardarEmpleado);

  document.getElementById("btn-confirmar-baja")
    .addEventListener("click", confirmarCambioEstado);

  document.getElementById("filtro-estado-empleado")
    .addEventListener("change", cargarEmpleados);

  document.getElementById("buscar-empleado")
    .addEventListener("input", debounce(cargarEmpleados, 350));

  // Cierre de modales (botones con data-close-modal="id-del-modal")
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-close-modal]")){
      const id = e.target.getAttribute("data-close-modal");
      document.getElementById(id).classList.remove("open");
    }
  });

  // Delegación para botones "Editar" / "Dar de baja" / "Reactivar" en la tabla
  document.getElementById("tabla-empleados-body")
    .addEventListener("click", (e) => {
      const fila = e.target.closest("tr");
      if (!fila) return;
      const id = fila.dataset.idEmpleado;

      if (e.target.classList.contains("accion-editar")){
        abrirModalEmpleado(id);
      }
      if (e.target.classList.contains("accion-baja")){
        abrirModalConfirmarBaja(id, fila.dataset.nombre, "baja");
      }
      if (e.target.classList.contains("accion-reactivar")){
        abrirModalConfirmarBaja(id, fila.dataset.nombre, "reactivar");
      }
    });
});

/* ---------- LISTAR ---------- */

async function cargarEmpleados(){
  const estado = document.getElementById("filtro-estado-empleado").value; // "", "1", "0"
  const busqueda = document.getElementById("buscar-empleado").value;

  const params = new URLSearchParams();
  if (estado !== "") params.set("estado", estado);
  if (busqueda) params.set("q", busqueda);

  try{
    const resp = await fetch(window.apiUrl(`/api/empleados?${params.toString()}`));
    if (!resp.ok) throw new Error("Error al obtener empleados");
    const empleados = await resp.json();
    renderizarTablaEmpleados(empleados);
  }catch(err){
    console.error(err);
  }
}

function renderizarTablaEmpleados(empleados){
  const tbody = document.getElementById("tabla-empleados-body");

  tbody.innerHTML = empleados.map(emp => `
    <tr data-id-empleado="${emp.id_empleado}" data-nombre="${emp.nombre} ${emp.apellido}">
      <td>${emp.numero_empleado}</td>
      <td>${emp.nombre} ${emp.apellido}</td>
      <td>${emp.departamento}</td>
      <td>${emp.rol}</td>
      <td>${emp.ubicacion}</td>
      <td>C$ ${emp.salario_base}</td>
      <td>
        ${emp.estado
          ? '<span class="tag presente">Activo</span>'
          : '<span class="tag falta">Inactivo</span>'}
      </td>
      <td class="acciones-cell">
        <span class="tag accion-editar">Editar</span>
        ${emp.estado
          ? '<span class="tag accion-baja">Dar de baja</span>'
          : '<span class="tag accion-reactivar">Reactivar</span>'}
      </td>
    </tr>
  `).join("");
}

/* ---------- CATÁLOGOS (para los <select> del modal) ---------- */

async function cargarCatalogos(){
  const resp = await fetch(window.apiUrl("/api/catalogos")); // { departamentos:[], roles:[], ubicaciones:[] }
  const data = await resp.json();

  llenarSelect("emp-departamento", data.departamentos, "id_departamento", "nombre");
  llenarSelect("emp-rol", data.roles, "id_rol", "nombre_rol");
  llenarSelect("emp-ubicacion", data.ubicaciones, "id_ubicacion", "nombre");
}

function llenarSelect(selectId, opciones, campoValor, campoTexto){
  const select = document.getElementById(selectId);
  if (!select || !Array.isArray(opciones)) return;
  const getValue = (obj, field) => {
    if (!obj || !field) return "";
    if (obj[field] !== undefined) return obj[field];
    const lower = field.toLowerCase();
    const match = Object.keys(obj).find(k => k.toLowerCase() === lower);
    return match ? obj[match] : "";
  };
  select.innerHTML = opciones
    .map(op => `<option value="${getValue(op, campoValor)}">${getValue(op, campoTexto)}</option>`)
    .join("");
}

/* ---------- AGREGAR / EDITAR ---------- */

async function abrirModalEmpleado(idEmpleado = null){
  const modal = document.getElementById("modal-empleado");
  const form = document.getElementById("form-empleado");
  const titulo = document.getElementById("modal-empleado-titulo");

  form.reset();
  document.getElementById("emp-id").value = "";

  if (idEmpleado){
    titulo.textContent = "Editar empleado";
    const resp = await fetch(window.apiUrl(`/api/empleados/${idEmpleado}`));
    const emp = await resp.json();

    document.getElementById("emp-id").value = emp.id_empleado;
    document.getElementById("emp-numero").value = emp.numero_empleado;
    document.getElementById("emp-inss").value = emp.inss;
    document.getElementById("emp-nombre").value = emp.nombre;
    document.getElementById("emp-apellido").value = emp.apellido;
    document.getElementById("emp-fecha").value = emp.fecha_contratacion;
    document.getElementById("emp-salario").value = emp.salario_base;
    document.getElementById("emp-departamento").value = emp.id_departamento;
    document.getElementById("emp-rol").value = emp.id_rol;
    document.getElementById("emp-ubicacion").value = emp.id_ubicacion;
  } else {
    titulo.textContent = "Agregar empleado";
  }

  modal.classList.add("open");
}

async function guardarEmpleado(){
  const form = document.getElementById("form-empleado");
  if (!form.reportValidity()) return; // validación nativa del navegador

  const idEmpleado = document.getElementById("emp-id").value;
  const payload = {
    numero_empleado: document.getElementById("emp-numero").value,
    inss: document.getElementById("emp-inss").value,
    nombre: document.getElementById("emp-nombre").value,
    apellido: document.getElementById("emp-apellido").value,
    fecha_contratacion: document.getElementById("emp-fecha").value,
    salario_base: document.getElementById("emp-salario").value,
    id_departamento: document.getElementById("emp-departamento").value,
    id_rol: document.getElementById("emp-rol").value,
    id_ubicacion: document.getElementById("emp-ubicacion").value,
  };

  const url = idEmpleado ? `/api/empleados/${idEmpleado}` : "/api/empleados";
  const fullUrl = window.apiUrl(url);
  const metodo = idEmpleado ? "PUT" : "POST";

  try{
    const resp = await fetch(fullUrl, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error("Error al guardar empleado");

    document.getElementById("modal-empleado").classList.remove("open");
    cargarEmpleados();
  }catch(err){
    console.error(err);
    alert("No se pudo guardar el empleado. Revisa los datos e intenta de nuevo.");
  }
}

/* ---------- DAR DE BAJA / REACTIVAR ---------- */

function abrirModalConfirmarBaja(idEmpleado, nombre, accion){
  empleadoIdBaja = { id: idEmpleado, accion }; // accion: "baja" | "reactivar"

  const titulo = document.getElementById("modal-confirmar-titulo");
  const texto = document.getElementById("modal-confirmar-texto");

  if (accion === "baja"){
    titulo.textContent = "Dar de baja a empleado";
    texto.innerHTML = `¿Confirmas dar de baja a <b>${nombre}</b>? Pasará a estado inactivo, pero su historial se conserva.`;
  } else {
    titulo.textContent = "Reactivar empleado";
    texto.innerHTML = `¿Confirmas reactivar a <b>${nombre}</b>? Volverá a aparecer como empleado activo.`;
  }

  document.getElementById("modal-confirmar").classList.add("open");
}

async function confirmarCambioEstado(){
  if (!empleadoIdBaja) return;
  const { id, accion } = empleadoIdBaja;
  const nuevoEstado = accion === "baja" ? 0 : 1;

  try{
    const resp = await fetch(window.apiUrl(`/api/empleados/${id}/estado`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!resp.ok) throw new Error("Error al actualizar estado");

    document.getElementById("modal-confirmar").classList.remove("open");
    cargarEmpleados();
  }catch(err){
    console.error(err);
    alert("No se pudo actualizar el estado del empleado.");
  }finally{
    empleadoIdBaja = null;
  }
}

/* ---------- UTILIDAD ---------- */

function debounce(fn, delay){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
