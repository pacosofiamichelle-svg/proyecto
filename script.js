const STORAGE_KEY = "gofit_usuarios";
const SESSION_KEY = "gofit_sesion";

const usuariosIniciales = [
    {
        nit: "123456789",
        password: "1234",
        nombre: "Juan Pérez",
        fechaInscripcion: "01/08/2026",
        fechaFin: "01/09/2026",
        tipoMembresia: "Membresía mensual",
        totalClases: 26,
        clasesAsistidas: 14,
        pagoEstado: "Pagada",
        asistencias: []
    },
    {
        nit: "987654321",
        password: "5678",
        nombre: "María González",
        fechaInscripcion: "15/08/2026",
        fechaFin: "15/09/2026",
        tipoMembresia: "Membresía mensual",
        totalClases: 26,
        clasesAsistidas: 18,
        pagoEstado: "Pagada",
        asistencias: []
    }
];

let usuarios = cargarUsuarios();
let usuarioActual = null;

function cargarUsuarios() {
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
        try { return JSON.parse(guardados); } catch (e) { console.log("Error leyendo usuarios guardados."); }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosIniciales));
    return JSON.parse(JSON.stringify(usuariosIniciales));
}

function guardarUsuarios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

/* =====================================================
   LÓGICA DE MEMBRESÍAS
   Mensual = 1 mes, trimestral = 3 meses, semestral = 6 meses.
   Las clases son los días del período en que el gimnasio abre:
   se excluyen todos los domingos.
===================================================== */
function mesesDeMembresia(tipo) {
    const texto = String(tipo || "").toLowerCase();
    if (texto.includes("semestral")) return 6;
    if (texto.includes("trimestral")) return 3;
    return 1;
}

function calcularFechaFin(fechaInicio, tipo) {
    const fecha = new Date(fechaInicio);
    const diaOriginal = fecha.getDate();
    fecha.setDate(1);
    fecha.setMonth(fecha.getMonth() + mesesDeMembresia(tipo));
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
    fecha.setDate(Math.min(diaOriginal, ultimoDia));
    return fecha;
}

function contarClases(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    let total = 0;
    const fecha = new Date(inicio);
    // La fecha de vencimiento no pertenece al período activo.
    while (fecha < fin) {
        // 0 = domingo. El gimnasio no abre los domingos.
        if (fecha.getDay() !== 0) total++;
        fecha.setDate(fecha.getDate() + 1);
    }
    return total;
}

function actualizarDatosMembresia(usuario) {
    const inicio = convertirFecha(usuario.fechaInscripcion);
    const fin = calcularFechaFin(inicio, usuario.tipoMembresia);
    usuario.fechaFin = formatearFecha(fin);
    usuario.totalClases = contarClases(inicio, fin);
    usuario.clasesAsistidas = Math.min(Number(usuario.clasesAsistidas) || 0, usuario.totalClases);
    return usuario;
}

function textoTiempoRestante(fechaFin, tipo) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(0, 0, 0, 0);

    if (fin <= hoy) return "0 días";

    if (mesesDeMembresia(tipo) === 1) {
        const dias = Math.ceil((fin - hoy) / 86400000);
        return `${dias} día${dias === 1 ? "" : "s"}`;
    }

    // Calcula meses completos + días restantes sin asumir que todos los meses tienen 30 días.
    let meses = 0;
    const cursor = new Date(hoy);
    while (true) {
        const siguiente = new Date(cursor);
        siguiente.setDate(1);
        siguiente.setMonth(siguiente.getMonth() + 1);
        const ultimo = new Date(siguiente.getFullYear(), siguiente.getMonth() + 1, 0).getDate();
        siguiente.setDate(Math.min(cursor.getDate(), ultimo));
        if (siguiente > fin) break;
        meses++;
        cursor.setTime(siguiente.getTime());
    }

    const dias = Math.ceil((fin - cursor) / 86400000);
    if (dias === 0) return `${meses} mes${meses === 1 ? "" : "es"}`;
    return `${meses} mes${meses === 1 ? "" : "es"} y ${dias} día${dias === 1 ? "" : "s"}`;
}

// Corrige datos antiguos guardados en localStorage que todavía tenían 20 clases
// o una fecha de vencimiento mensual aunque fueran trimestrales/semestrales.
usuarios.forEach(actualizarDatosMembresia);
guardarUsuarios();

function mostrarMensaje(id, texto, tipo = "error") {
    const elemento = document.getElementById(id);
    elemento.textContent = texto;
    elemento.style.display = "block";
    elemento.className = tipo;
}

function ocultarMensaje(id) {
    const elemento = document.getElementById(id);
    elemento.style.display = "none";
}

/* =====================================================
   LOGIN
===================================================== */
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    ocultarMensaje("errorMessage");
    ocultarMensaje("successMessage");

    const nit = limpiarNit(document.getElementById("nit").value);
    const password = document.getElementById("password").value;

    if (!nit || !password) {
        mostrarMensaje("errorMessage", "Completa el NIT y la contraseña.");
        return;
    }

    const usuario = usuarios.find(user => limpiarNit(user.nit) === nit);
    if (!usuario) {
        mostrarMensaje("errorMessage", "El NIT no está registrado en GOFIT GYM.");
        return;
    }
    if (usuario.password !== password) {
        mostrarMensaje("errorMessage", "La contraseña es incorrecta.");
        return;
    }

    actualizarDatosMembresia(usuario);
    guardarUsuarios();
    usuarioActual = usuario;
    localStorage.setItem(SESSION_KEY, usuario.nit);
    mostrarDashboard(usuario);
});

/* =====================================================
   REGISTRO
===================================================== */
document.getElementById("mostrarRegistroBtn").addEventListener("click", mostrarRegistro);
document.getElementById("volverLoginBtn").addEventListener("click", mostrarLogin);

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();
    ocultarMensaje("registerError");

    const nombre = document.getElementById("registroNombre").value.trim();
    const nit = limpiarNit(document.getElementById("registroNit").value);
    const password = document.getElementById("registroPassword").value;
    const confirmacion = document.getElementById("registroPassword2").value;
    const tipo = document.getElementById("registroMembresia").value;

    if (nombre.length < 3) {
        mostrarMensaje("registerError", "Ingresa un nombre completo válido.");
        return;
    }
    if (!/^\d+$/.test(nit)) {
        mostrarMensaje("registerError", "El NIT debe contener solamente números.");
        return;
    }
    if (password.length < 4) {
        mostrarMensaje("registerError", "La contraseña debe tener al menos 4 caracteres.");
        return;
    }
    if (password !== confirmacion) {
        mostrarMensaje("registerError", "Las contraseñas no coinciden.");
        return;
    }
    if (usuarios.some(user => limpiarNit(user.nit) === nit)) {
        mostrarMensaje("registerError", "Ese NIT ya está registrado. Si es tu cuenta, inicia sesión.");
        return;
    }

    const hoy = new Date();
    const fechaFin = calcularFechaFin(hoy, tipo);
    const nuevoUsuario = {
        nit,
        password,
        nombre,
        fechaInscripcion: formatearFecha(hoy),
        fechaFin: formatearFecha(fechaFin),
        tipoMembresia: tipo,
        totalClases: contarClases(hoy, fechaFin),
        clasesAsistidas: 0,
        pagoEstado: "Pagada",
        asistencias: []
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios();
    document.getElementById("registerForm").reset();
    mostrarLogin();
    document.getElementById("nit").value = nit;
    document.getElementById("password").value = password;
    mostrarMensaje("successMessage", "Cuenta creada correctamente. Ya puedes ingresar.", "success");
});

function mostrarDashboard(usuario) {
    actualizarDatosMembresia(usuario);
    guardarUsuarios();

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    document.getElementById("nombreUsuario").textContent = usuario.nombre.split(" ")[0];
    document.getElementById("navNombre").textContent = usuario.nombre;
    document.getElementById("nombreCompleto").textContent = usuario.nombre;
    document.getElementById("nitUsuario").textContent = usuario.nit;
    document.getElementById("fechaInscripcion").textContent = usuario.fechaInscripcion;
    document.getElementById("fechaFin").textContent = usuario.fechaFin;
    document.getElementById("tipoMembresia").textContent = usuario.tipoMembresia;
    document.getElementById("totalClases").textContent = usuario.totalClases;
    document.getElementById("clasesAsistidas").textContent = usuario.clasesAsistidas;
    document.getElementById("asistencias").textContent = `${usuario.clasesAsistidas} de ${usuario.totalClases}`;

    const porcentaje = usuario.totalClases > 0
        ? Math.min(100, Math.round((usuario.clasesAsistidas / usuario.totalClases) * 100))
        : 0;
    document.getElementById("porcentaje").textContent = porcentaje + "%";
    document.getElementById("progressText").textContent = porcentaje + "%";
    document.getElementById("progress").style.width = porcentaje + "%";
    document.getElementById("pagoUsuario").textContent = usuario.pagoEstado;

    comprobarMembresia(usuario);
    cargarHistorial(usuario.asistencias || []);
}

function comprobarMembresia(usuario) {
    actualizarDatosMembresia(usuario);
    const fechaVencimiento = convertirFecha(usuario.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);

    const dias = Math.max(0, Math.ceil((fechaVencimiento - hoy) / 86400000));
    const estado = document.getElementById("estado");
    const alertBox = document.getElementById("alertBox");
    const diasRestantes = document.getElementById("diasRestantes");
    const pagada = usuario.pagoEstado === "Pagada";
    const vigente = fechaVencimiento > hoy;
    const accesoPermitido = pagada && vigente;
    const tiempo = textoTiempoRestante(fechaVencimiento, usuario.tipoMembresia);

    if (accesoPermitido) {
        diasRestantes.textContent = tiempo;
        estado.textContent = "MEMBRESÍA ACTIVA";
        alertBox.innerHTML = `<strong>Pago al día</strong><p>Tu ${usuario.tipoMembresia.toLowerCase()} está vigente y tu pago está registrado. Te quedan <b>${tiempo}</b>.</p>`;
        estado.style.color = "var(--naranja)";
        document.getElementById("pagoUsuario").style.color = "var(--verde)";
        document.getElementById("pagoUsuario").textContent = "Pagada";
    } else {
        diasRestantes.textContent = "0 días";
        estado.textContent = pagada ? "MEMBRESÍA VENCIDA" : "PAGO PENDIENTE";
        alertBox.innerHTML = `<strong>${pagada ? "Membresía vencida" : "Pago pendiente"}</strong><p>${pagada ? "Tu membresía terminó." : "Tu pago está pendiente."} El acceso al gimnasio permanece bloqueado hasta regularizar tu situación.</p>`;
        estado.style.color = "var(--rojo)";
        document.getElementById("pagoUsuario").style.color = "var(--rojo)";
    }

    actualizarBotonAcceso(accesoPermitido);
    guardarUsuarios();
}

/* =====================================================
   BOTÓN DE ACCESO
===================================================== */
function actualizarBotonAcceso(permitido) {
    const boton = document.getElementById("accessButton");
    const mensaje = document.getElementById("accessMessage");
    boton.classList.remove("access-ok", "access-blocked");

    if (permitido) {
        boton.textContent = "COMPROBAR ACCESO";
        boton.classList.add("access-ok");
        mensaje.textContent = "Tu membresía está al día. Puedes solicitar el ingreso.";
    } else {
        boton.textContent = "ACCESO BLOQUEADO";
        boton.classList.add("access-blocked");
        mensaje.textContent = "No puedes ingresar mientras tu membresía esté pendiente o vencida.";
    }
}

document.getElementById("accessButton").addEventListener("click", function() {
    if (!usuarioActual) return;
    actualizarDatosMembresia(usuarioActual);

    const fechaFin = convertirFecha(usuarioActual.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);
    const permitido = usuarioActual.pagoEstado === "Pagada" && fechaFin > hoy;

    if (!permitido) {
        document.getElementById("accessMessage").textContent = "✕ ACCESO DENEGADO: debes pagar o renovar tu membresía.";
        actualizarBotonAcceso(false);
        return;
    }

    const ahora = new Date();
    const nuevaAsistencia = {
        fecha: formatearFecha(ahora),
        hora: ahora.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }),
        actividad: "Ingreso al gimnasio",
        estado: "Presente"
    };

    const asistencias = usuarioActual.asistencias || [];
    const yaRegistrado = asistencias.some(a => a.fecha === nuevaAsistencia.fecha && a.actividad === "Ingreso al gimnasio");

    if (!yaRegistrado) {
        usuarioActual.asistencias = asistencias;
        usuarioActual.asistencias.unshift(nuevaAsistencia);
        usuarioActual.clasesAsistidas = Math.min(usuarioActual.totalClases, usuarioActual.clasesAsistidas + 1);
        guardarUsuarios();
        mostrarDashboard(usuarioActual);
    }

    document.getElementById("accessMessage").textContent = "✓ Acceso autorizado. Tu entrada quedó registrada.";
});

/* =====================================================
   HISTORIAL
===================================================== */
function cargarHistorial(asistencias) {
    const tabla = document.getElementById("tablaAsistencias");
    const vacio = document.getElementById("emptyHistory");
    tabla.innerHTML = "";

    if (!asistencias || asistencias.length === 0) {
        vacio.hidden = false;
        return;
    }
    vacio.hidden = true;

    asistencias.forEach(asistencia => {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td>${escaparHTML(asistencia.fecha)}</td><td>${escaparHTML(asistencia.hora)}</td><td>${escaparHTML(asistencia.actividad)}</td><td><span class="status-present">${escaparHTML(asistencia.estado)}</span></td>`;
        tabla.appendChild(fila);
    });
}

function buscarAsistencia() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    document.querySelectorAll("#tablaAsistencias tr").forEach(fila => {
        fila.style.display = fila.textContent.toLowerCase().includes(texto) ? "" : "none";
    });
}

/* =====================================================
   SESIÓN
===================================================== */
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem(SESSION_KEY);
    document.getElementById("dashboard").style.display = "none";
    mostrarLogin();
    document.getElementById("loginForm").reset();
    document.getElementById("buscador").value = "";
    ocultarMensaje("errorMessage");
    ocultarMensaje("successMessage");
}

function mostrarRegistro() {
    ocultarMensaje("errorMessage");
    ocultarMensaje("successMessage");
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "flex";
}

function mostrarLogin() {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "flex";
}

window.addEventListener("DOMContentLoaded", function() {
    const nitSesion = localStorage.getItem(SESSION_KEY);
    if (!nitSesion) return;
    const usuario = usuarios.find(user => limpiarNit(user.nit) === limpiarNit(nitSesion));
    if (usuario) {
        usuarioActual = usuario;
        mostrarDashboard(usuario);
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
});

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */
function limpiarNit(nit) {
    return String(nit).replace(/\D/g, "");
}

function convertirFecha(fecha) {
    const partes = String(fecha).split("/");
    return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
}

function formatearFecha(fecha) {
    return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
}

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[caracter]));
}
