"use strict";

const STORAGE_KEY = "gofit_usuarios";
const SESSION_KEY = "gofit_sesion";
const ADMIN_NIT = "000000000";
const INSTRUCTORES_KEY = "gofit_instructores";

function cargarInstructores() {
    try {
        const guardados = JSON.parse(localStorage.getItem(INSTRUCTORES_KEY));
        return Array.isArray(guardados) ? guardados : [];
    } catch {
        return [];
    }
}

let instructores = cargarInstructores();

const PLANES = {
    "Membresía mensual": { meses: 1, clases: 20 },
    "Membresía trimestral": { meses: 3, clases: 60 },
    "Membresía semestral": { meses: 6, clases: 120 }
};

const INSTRUCTORES = ["Instructor de mañana", "Instructor de tarde"];

const RUTINA_SEMANAL = [
    { dia: "Lunes", musculo: "Glúteos", ejercicios: "Hip thrust, sentadillas y patada de glúteo", equipo: "Banco, barra, mancuernas y polea" },
    { dia: "Martes", musculo: "Brazos", ejercicios: "Curl de bíceps, extensión de tríceps y fondos", equipo: "Mancuernas, polea y banco" },
    { dia: "Miércoles", musculo: "Espalda", ejercicios: "Jalón al pecho y remo sentado", equipo: "Polea alta y máquina de remo" },
    { dia: "Jueves", musculo: "Piernas", ejercicios: "Prensa, extensión de piernas y curl femoral", equipo: "Prensa y máquinas de piernas" },
    { dia: "Viernes", musculo: "Pecho y hombros", ejercicios: "Press de pecho y elevaciones laterales", equipo: "Banco, mancuernas y máquina de pecho" },
    { dia: "Sábado", musculo: "Cardio y abdomen", ejercicios: "Caminata, bicicleta y plancha", equipo: "Caminadora, bicicleta y colchoneta" }
];

const usuariosIniciales = [
    {
        nit: "123456789", password: "1234", nombre: "Juan Pérez",
        fechaInscripcion: "01/08/2026", fechaFin: "01/09/2026",
        tipoMembresia: "Membresía mensual", totalClases: 20,
        clasesAsistidas: 14, pagoEstado: "Pagada",
        instructor: "Instructor de tarde", asistencias: []
    },
    {
        nit: "987654321", password: "5678", nombre: "María González",
        fechaInscripcion: "15/08/2026", fechaFin: "15/09/2026",
        tipoMembresia: "Membresía mensual", totalClases: 20,
        clasesAsistidas: 18, pagoEstado: "Pagada",
        instructor: "Instructor de mañana", asistencias: []
    }
];

function cargarUsuarios() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(guardados)) return guardados;
    } catch (error) {
        console.error("No se pudieron leer los usuarios guardados.", error);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosIniciales));
    return JSON.parse(JSON.stringify(usuariosIniciales));
}

let usuarios = cargarUsuarios();
let usuarioActual = null;

function guardarUsuarios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

function porId(id) {
    return document.getElementById(id);
}

function mostrarMensaje(id, texto, tipo = "error") {
    const elemento = porId(id);
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.style.display = "block";
    elemento.className = tipo;
}

function ocultarMensaje(id) {
    const elemento = porId(id);
    if (elemento) elemento.style.display = "none";
}

function limpiarNit(nit) {
    return String(nit ?? "").replace(/\D/g, "");
}

function convertirFecha(fecha) {
    if (!fecha || typeof fecha !== "string") return new Date(NaN);
    const partes = fecha.split("/").map(Number);
    if (partes.length !== 3) return new Date(NaN);
    return new Date(partes[2], partes[1] - 1, partes[0]);
}

function formatearFecha(fecha) {
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function sumarMeses(fecha, meses) {
    const resultado = new Date(fecha);
    const diaOriginal = resultado.getDate();
    resultado.setDate(1);
    resultado.setMonth(resultado.getMonth() + meses);
    const ultimoDia = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
    resultado.setDate(Math.min(diaOriginal, ultimoDia));
    return resultado;
}

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[caracter]);
}

function mostrarRegistro() {
    ocultarMensaje("errorMessage");
    ocultarMensaje("successMessage");
    porId("loginSection").style.display = "none";
    porId("registerSection").style.display = "flex";
}

function mostrarLogin() {
    porId("registerSection").style.display = "none";
    porId("loginSection").style.display = "flex";
}

function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem(SESSION_KEY);
    porId("dashboard").style.display = "none";
    porId("adminPanel").style.display = "none";
    porId("loginSection").style.display = "flex";
    porId("password").value = "";
}

function mostrarDashboard(usuario) {
    porId("loginSection").style.display = "none";
    porId("registerSection").style.display = "none";
    porId("dashboard").style.display = "block";
    if (usuario.rol === "instructor") {
    document.querySelector("#dashboard main.content").style.display = "none";
    document.getElementById("adminPanel").style.display = "none";

    const panelInstructor = document.getElementById("instructorPanel");
    if (!panelInstructor) {
        alert("Falta agregar id=\"instructorPanel\" en index.html.");
        return;
    }

    panelInstructor.style.display = "block";
    document.getElementById("navNombre").textContent =
        `${usuario.nombre} (${usuario.turno})`;

    if (typeof renderInstructor === "function") {
        renderInstructor(usuario);
    }

    return;
}

    const contenidoUsuario = document.querySelector("#dashboard main.content");
    const panelAdmin = porId("adminPanel");

    if (usuario.rol === "admin") {
        if (contenidoUsuario) contenidoUsuario.style.display = "none";
        if (panelAdmin) panelAdmin.style.display = "block";
        porId("navNombre").textContent = "Administrador";
        renderAdmin();
        return;
    }

    if (contenidoUsuario) contenidoUsuario.style.display = "block";
    if (panelAdmin) panelAdmin.style.display = "none";

    porId("nombreUsuario").textContent = (usuario.nombre || "Usuario").split(" ")[0];
    porId("navNombre").textContent = usuario.nombre || "Usuario";
    porId("nombreCompleto").textContent = usuario.nombre || "-";
    porId("nitUsuario").textContent = usuario.nit || "-";
    porId("fechaInscripcion").textContent = usuario.fechaInscripcion || "Pendiente";
    porId("fechaFin").textContent = usuario.fechaFin || "Pendiente";
    porId("tipoMembresia").textContent = usuario.tipoMembresia || "Sin asignar";
    porId("totalClases").textContent = usuario.totalClases || 0;
    porId("clasesAsistidas").textContent = usuario.clasesAsistidas || 0;
    porId("asistencias").textContent = `${usuario.clasesAsistidas || 0} de ${usuario.totalClases || 0}`;
    porId("pagoUsuario").textContent = usuario.pagoEstado || "Pendiente";

    const porcentaje = usuario.totalClases > 0
        ? Math.min(100, Math.round(((usuario.clasesAsistidas || 0) / usuario.totalClases) * 100))
        : 0;
    porId("porcentaje").textContent = `${porcentaje}%`;
    porId("progressText").textContent = `${porcentaje}%`;
    porId("progress").style.width = `${porcentaje}%`;

    comprobarMembresia(usuario);
    cargarHistorial(usuario.asistencias || []);
}

function comprobarMembresia(usuario) {
    const estado = porId("estado");
    const alerta = porId("alertBox");
    const diasRestantes = porId("diasRestantes");
    const pago = porId("pagoUsuario");

    if (!usuario.fechaFin || !PLANES[usuario.tipoMembresia]) {
        estado.textContent = "MEMBRESÍA PENDIENTE";
        diasRestantes.textContent = "-";
        alerta.innerHTML = "<strong>Esperando asignación</strong><p>El administrador debe asignarte una membresía.</p>";
        actualizarBotonAcceso(false);
        return;
    }

    const vencimiento = convertirFecha(usuario.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);
    const dias = Math.ceil((vencimiento - hoy) / 86400000);
    const pagada = usuario.pagoEstado === "Pagada";
    const vigente = Number.isFinite(dias) && dias >= 0;
    const permitido = pagada && vigente && (usuario.clasesAsistidas || 0) < (usuario.totalClases || 0);

    diasRestantes.textContent = vigente ? String(dias) : "0";
    estado.textContent = permitido ? "MEMBRESÍA ACTIVA" : (pagada ? "MEMBRESÍA VENCIDA" : "PAGO PENDIENTE");
    estado.style.color = permitido ? "var(--naranja)" : "var(--rojo)";
    pago.style.color = pagada ? "var(--verde)" : "var(--rojo)";
    alerta.innerHTML = permitido
        ? `<strong>Pago al día</strong><p>Tu membresía está vigente. Te quedan <b>${dias} días</b>.</p>`
        : `<strong>${pagada ? "Membresía vencida" : "Pago pendiente"}</strong><p>Consulta con administración para regularizar tu membresía.</p>`;
    actualizarBotonAcceso(permitido);
}

function actualizarBotonAcceso(permitido) {
    const boton = porId("accessButton");
    boton.classList.remove("access-ok", "access-blocked");
    boton.textContent = permitido ? "COMPROBAR ACCESO" : "ACCESO BLOQUEADO";
    boton.classList.add(permitido ? "access-ok" : "access-blocked");
    porId("accessMessage").textContent = permitido
        ? "Tu membresía está vigente y puedes registrar tu entrada."
        : "El acceso está bloqueado hasta tener una membresía pagada y vigente.";
}

function registrarAsistencia(usuario, actividad) {
    const plan = PLANES[usuario.tipoMembresia];
    const vencimiento = convertirFecha(usuario.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (!plan || !Number.isFinite(vencimiento.getTime()) || vencimiento < hoy) return "La membresía no está vigente.";
    if (usuario.pagoEstado !== "Pagada") return "El pago está pendiente.";
    if ((usuario.clasesAsistidas || 0) >= (usuario.totalClases || 0)) return "Ya se utilizaron todas las clases del plan.";

    const ahora = new Date();
    usuario.asistencias = usuario.asistencias || [];
    usuario.asistencias.unshift({
        fecha: formatearFecha(ahora),
        hora: ahora.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }),
        actividad,
        estado: "Presente"
    });
    usuario.clasesAsistidas = (usuario.clasesAsistidas || 0) + 1;
    guardarUsuarios();
    return "";
}

function cargarHistorial(asistencias) {
    const tabla = porId("tablaAsistencias");
    const vacio = porId("emptyHistory");
    tabla.innerHTML = "";
    vacio.hidden = asistencias.length > 0;
    asistencias.forEach(asistencia => {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td>${escaparHTML(asistencia.fecha)}</td><td>${escaparHTML(asistencia.hora)}</td><td>${escaparHTML(asistencia.actividad)}</td><td><span class="status-present">${escaparHTML(asistencia.estado)}</span></td>`;
        tabla.appendChild(fila);
    });
}

function buscarAsistencia() {
    if (!usuarioActual || usuarioActual.rol === "admin") return;
    const texto = porId("buscador").value.toLowerCase();
    const filtradas = (usuarioActual.asistencias || []).filter(item =>
        `${item.fecha} ${item.actividad} ${item.estado}`.toLowerCase().includes(texto)
    );
    cargarHistorial(filtradas);
}

function asignarMembresia(usuario, nombrePlan) {
    const plan = PLANES[nombrePlan];
    if (!plan) return;
    const hoy = new Date();
    usuario.tipoMembresia = nombrePlan;
    usuario.fechaInscripcion = formatearFecha(hoy);
    usuario.fechaFin = formatearFecha(sumarMeses(hoy, plan.meses));
    usuario.totalClases = plan.clases;
    usuario.clasesAsistidas = 0;
    usuario.asistencias = [];
}

function renderCalendario() {
    const contenedor = porId("calendarioEntrenamiento");
    if (!contenedor) return;
    contenedor.innerHTML = RUTINA_SEMANAL.map(item => `
        <article class="training-card">
            <strong>${item.dia}: ${item.musculo}</strong>
            <p><b>Ejercicios:</b> ${item.ejercicios}</p>
            <p><b>Equipo:</b> ${item.equipo}</p>
            <p><b>Sugerencia:</b> Calienta antes de empezar y ajusta la carga con tu instructor.</p>
        </article>
    `).join("");
}

function renderAdmin() {
    const tabla = porId("adminUsuarios");
    if (!tabla) return;

    tabla.innerHTML = usuarios.map((usuario, indice) => {
        const planActual = PLANES[usuario.tipoMembresia] ? usuario.tipoMembresia : "";
        const instructorActual = INSTRUCTORES.includes(usuario.instructor) ? usuario.instructor : "";
        return `
            <tr>
                <td>${escaparHTML(usuario.nombre)}</td>
                <td>${escaparHTML(usuario.nit)}</td>
                <td><select data-plan="${indice}"><option value="">${planActual ? "Conservar plan" : "Elegir plan"}</option>${Object.entries(PLANES).map(([nombre, plan]) => `<option value="${nombre}" ${nombre === planActual ? "selected" : ""}>${nombre} (${plan.clases} clases)</option>`).join("")}</select></td>
                <td><select data-pago="${indice}"><option ${usuario.pagoEstado === "Pendiente" ? "selected" : ""}>Pendiente</option><option ${usuario.pagoEstado === "Pagada" ? "selected" : ""}>Pagada</option></select></td>
                <td><select data-instructor="${indice}"><option value="">Sin asignar</option>${INSTRUCTORES.map(nombre => `<option value="${nombre}" ${nombre === instructorActual ? "selected" : ""}>${nombre}</option>`).join("")}</select></td>
                <td>${usuario.clasesAsistidas || 0} / ${usuario.totalClases || 0}</td>
                <td><button type="button" data-guardar="${indice}">Guardar</button> <button type="button" data-asistencia="${indice}">Marcar asistencia</button></td>
            </tr>
        `;
    }).join("");

    renderCalendario();
}

function manejarAccionAdmin(event) {
    const boton = event.target.closest("button");
    if (!boton) return;
    const indice = Number(boton.dataset.guardar ?? boton.dataset.asistencia);
    const usuario = usuarios[indice];
    if (!usuario) return;

    if (boton.dataset.guardar !== undefined) {
        const plan = document.querySelector(`[data-plan="${indice}"]`).value;
        const pago = document.querySelector(`[data-pago="${indice}"]`).value;
        const instructor = document.querySelector(`[data-instructor="${indice}"]`).value;
        if (plan && plan !== usuario.tipoMembresia) asignarMembresia(usuario, plan);
        usuario.pagoEstado = pago;
        usuario.instructor = instructor || "Sin asignar";
        guardarUsuarios();
        renderAdmin();
        alert("Datos guardados.");
        return;
    }

    if (boton.dataset.asistencia !== undefined) {
        const error = registrarAsistencia(usuario, "Asistencia registrada por administración");
        if (error) alert(error);
        else alert("Asistencia registrada.");
        renderAdmin();
    }
}

function iniciarSesionAdmin() {
    usuarioActual = { nit: ADMIN_NIT, nombre: "Administrador", rol: "admin" };
    localStorage.setItem(SESSION_KEY, "ADMIN");
    mostrarDashboard(usuarioActual);
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    ocultarMensaje("errorMessage");
    ocultarMensaje("successMessage");
    const nit = limpiarNit(porId("nit").value);
    const password = porId("password").value;
    const instructor = instructores.find(
    item => limpiarNit(item.nit) === nit
);

if (instructor) {
    if (instructor.password !== password) {
        mostrarMensaje("errorMessage", "La contraseña del instructor es incorrecta.");
        return;
    }

    usuarioActual = { ...instructor, rol: "instructor" };
    localStorage.setItem(SESSION_KEY, `INSTRUCTOR:${instructor.nit}`);
    mostrarDashboard(usuarioActual);
    return;
}

// Debajo de este bloque va la búsqueda normal del usuario:
const usuario = usuarios.find(
    item => limpiarNit(item.nit) === nit
);

    if (!nit || !password) return mostrarMensaje("errorMessage", "Completa el NIT y la contraseña.");
    if (!usuario) return mostrarMensaje("errorMessage", "El NIT no está registrado en GOFIT GYM.");
    if (usuario.password !== password) return mostrarMensaje("errorMessage", "La contraseña es incorrecta.");

    usuarioActual = usuario;
    localStorage.setItem(SESSION_KEY, usuario.nit);
    mostrarDashboard(usuario);
});

document.getElementById("adminLoginBtn").addEventListener("click", iniciarSesionAdmin);
document.getElementById("mostrarRegistroBtn").addEventListener("click", mostrarRegistro);
document.getElementById("volverLoginBtn").addEventListener("click", mostrarLogin);
document.getElementById("adminUsuarios").addEventListener("click", manejarAccionAdmin);

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();
    ocultarMensaje("registerError");
    const nombre = porId("registroNombre").value.trim();
    const nit = limpiarNit(porId("registroNit").value);
    const password = porId("registroPassword").value;
    const confirmacion = porId("registroPassword2").value;

    if (nombre.length < 3) return mostrarMensaje("registerError", "Ingresa un nombre completo válido.");
    if (!/^\d+$/.test(nit) || nit === ADMIN_NIT) return mostrarMensaje("registerError", "Ingresa un NIT válido.");
    if (password.length < 4) return mostrarMensaje("registerError", "La contraseña debe tener al menos 4 caracteres.");
    if (password !== confirmacion) return mostrarMensaje("registerError", "Las contraseñas no coinciden.");
    if (usuarios.some(user => limpiarNit(user.nit) === nit)) return mostrarMensaje("registerError", "Ese NIT ya está registrado.");

    usuarios.push({
        nit, password, nombre, rol: "usuario", fechaInscripcion: "", fechaFin: "",
        tipoMembresia: "Sin asignar", totalClases: 0, clasesAsistidas: 0,
        pagoEstado: "Pendiente", instructor: "Sin asignar", asistencias: []
    });
    guardarUsuarios();
    porId("registerForm").reset();
    mostrarLogin();
    porId("nit").value = nit;
    porId("password").value = "";
    mostrarMensaje("successMessage", "Cuenta creada. El administrador asignará tu membresía.", "success");
});

document.getElementById("accessButton").addEventListener("click", function() {
    if (!usuarioActual || usuarioActual.rol === "admin") return;
    const error = registrarAsistencia(usuarioActual, "Ingreso al gimnasio");
    if (error) {
        porId("accessMessage").textContent = `Acceso denegado: ${error}`;
        return;
    }
    mostrarDashboard(usuarioActual);
    porId("accessMessage").textContent = "Acceso autorizado. Tu entrada quedó registrada.";
});

window.addEventListener("DOMContentLoaded", function() {
    const sesion = localStorage.getItem(SESSION_KEY);
    if (!sesion) return;
    if (sesion === "ADMIN") {
        usuarioActual = { nit: ADMIN_NIT, nombre: "Administrador", rol: "admin" };
        mostrarDashboard(usuarioActual);
        return;
    }
    const usuario = usuarios.find(item => limpiarNit(item.nit) === limpiarNit(sesion));
    if (usuario) {
        usuarioActual = usuario;
        mostrarDashboard(usuario);
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
});

window.cerrarSesion = cerrarSesion;
window.buscarAsistencia = buscarAsistencia;
function guardarInstructores() {
    localStorage.setItem(INSTRUCTORES_KEY, JSON.stringify(instructores));
}

function renderTablaInstructores() {
    const tabla = document.getElementById("tablaInstructores");
    if (!tabla) return;

    tabla.innerHTML = instructores.map((item, indice) => `
        <tr>
            <td>${escaparHTML(item.nombre)}</td>
            <td>${escaparHTML(item.nit)}</td>
            <td>${escaparHTML(item.password)}</td>
            <td>${escaparHTML(item.turno)}</td>
            <td>
                <button type="button" data-quitar-instructor="${indice}">
                    Quitar
                </button>
            </td>
        </tr>
    `).join("");
}

document.getElementById("formCrearInstructor")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nuevoInstructorNombre").value.trim();
    const nit = limpiarNit(document.getElementById("nuevoInstructorNit").value);
    const password = document.getElementById("nuevoInstructorPassword").value;
    const turno = document.getElementById("nuevoInstructorTurno").value;

    if (!nombre || !nit || password.length < 4) {
        alert("Completa los datos. La contraseña debe tener al menos 4 caracteres.");
        return;
    }

    const nitRepetido =
        instructores.some(item => item.nit === nit) ||
        usuarios.some(item => limpiarNit(item.nit) === nit);

    if (nitRepetido) {
        alert("Ese NIT ya está registrado.");
        return;
    }

    instructores.push({ nombre, nit, password, turno });
    guardarInstructores();
    event.currentTarget.reset();
    renderTablaInstructores();
    alert("Instructor registrado.");
});

renderTablaInstructores();