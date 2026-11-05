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

        totalClases: 20,
        clasesAsistidas: 14,

        pagoEstado: "Pagada",

        asistencias: [

            {
                fecha: "25/08/2026",
                hora: "18:30",
                actividad: "Entrenamiento",
                estado: "Presente"
            },

            {
                fecha: "23/08/2026",
                hora: "19:00",
                actividad: "Entrenamiento",
                estado: "Presente"
            },

            {
                fecha: "21/08/2026",
                hora: "18:15",
                actividad: "Cardio",
                estado: "Presente"
            },

            {
                fecha: "19/08/2026",
                hora: "17:45",
                actividad: "Entrenamiento",
                estado: "Presente"
            },

            {
                fecha: "17/08/2026",
                hora: "18:30",
                actividad: "Piernas",
                estado: "Presente"
            },

            {
                fecha: "15/08/2026",
                hora: "19:10",
                actividad: "Entrenamiento",
                estado: "Presente"
            }

        ]

    },


    {
        nit: "987654321",
        password: "5678",

        nombre: "María González",

        fechaInscripcion: "15/08/2026",
        fechaFin: "15/09/2026",

        tipoMembresia: "Membresía mensual",

        totalClases: 20,
        clasesAsistidas: 18,

        pagoEstado: "Pagada",

        asistencias: [

            {
                fecha: "25/08/2026",
                hora: "17:30",
                actividad: "Cardio",
                estado: "Presente"
            },

            {
                fecha: "24/08/2026",
                hora: "18:00",
                actividad: "Entrenamiento",
                estado: "Presente"
            },

            {
                fecha: "22/08/2026",
                hora: "17:45",
                actividad: "Piernas",
                estado: "Presente"
            },

            {
                fecha: "20/08/2026",
                hora: "18:30",
                actividad: "Cardio",
                estado: "Presente"
            }

        ]

    }

];


let usuarios = cargarUsuarios();

let usuarioActual = null;


function cargarUsuarios() {

    const guardados =
        localStorage.getItem(STORAGE_KEY);

    if (guardados) {

        try {

            return JSON.parse(guardados);

        } catch (error) {

            console.log(
                "Error leyendo usuarios guardados."
            );

        }

    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(usuariosIniciales)
    );

    return JSON.parse(
        JSON.stringify(usuariosIniciales)
    );

}


function guardarUsuarios() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(usuarios)
    );

}


function mostrarMensaje(
    id,
    texto,
    tipo = "error"
) {

    const elemento =
        document.getElementById(id);

    elemento.textContent = texto;

    elemento.style.display = "block";

    elemento.className = tipo;

}


function ocultarMensaje(id) {

    const elemento =
        document.getElementById(id);

    elemento.style.display = "none";

}


document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            ocultarMensaje("errorMessage");

            ocultarMensaje("successMessage");


            const nit =
                limpiarNit(
                    document
                        .getElementById("nit")
                        .value
                );


            const password =
                document
                    .getElementById("password")
                    .value;


            if (!nit || !password) {

                mostrarMensaje(
                    "errorMessage",
                    "Completa el NIT y la contraseña."
                );

                return;

            }


            const usuario =
                usuarios.find(
                    function(user) {

                        return (
                            limpiarNit(user.nit) === nit
                        );

                    }
                );


            if (!usuario) {

                mostrarMensaje(
                    "errorMessage",
                    "El NIT no está registrado en GOFIT GYM."
                );

                return;

            }


            if (usuario.password !== password) {

                mostrarMensaje(
                    "errorMessage",
                    "La contraseña es incorrecta."
                );

                return;

            }


            usuarioActual = usuario;


            localStorage.setItem(
                SESSION_KEY,
                usuario.nit
            );


            mostrarDashboard(usuario);

        }
    );


/* =====================================================
   REGISTRO
===================================================== */

document
    .getElementById("mostrarRegistroBtn")
    .addEventListener(
        "click",
        mostrarRegistro
    );


document
    .getElementById("volverLoginBtn")
    .addEventListener(
        "click",
        mostrarLogin
    );


document
    .getElementById("registerForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            ocultarMensaje("registerError");


            const nombre =
                document
                    .getElementById("registroNombre")
                    .value
                    .trim();


            const nit =
                limpiarNit(
                    document
                        .getElementById("registroNit")
                        .value
                );


            const password =
                document
                    .getElementById("registroPassword")
                    .value;


            const confirmacion =
                document
                    .getElementById("registroPassword2")
                    .value;


            const tipo =
                document
                    .getElementById("registroMembresia")
                    .value;


            if (nombre.length < 3) {

                mostrarMensaje(
                    "registerError",
                    "Ingresa un nombre completo válido."
                );

                return;

            }


            if (!/^\d+$/.test(nit)) {

                mostrarMensaje(
                    "registerError",
                    "El NIT debe contener solamente números."
                );

                return;

            }


            if (password.length < 4) {

                mostrarMensaje(
                    "registerError",
                    "La contraseña debe tener al menos 4 caracteres."
                );

                return;

            }


            if (password !== confirmacion) {

                mostrarMensaje(
                    "registerError",
                    "Las contraseñas no coinciden."
                );

                return;

            }


            const existe =
                usuarios.some(
                    function(user) {

                        return (
                            limpiarNit(user.nit) === nit
                        );

                    }
                );


            if (existe) {

                mostrarMensaje(
                    "registerError",
                    "Ese NIT ya está registrado. Si es tu cuenta, inicia sesión."
                );

                return;

            }


            const hoy = new Date();


            const fechaInscripcion =
                formatearFecha(hoy);


            const fechaFinDate =
                new Date(hoy);


            fechaFinDate.setMonth(
                fechaFinDate.getMonth() + 1
            );


            const nuevoUsuario = {

                nit: nit,

                password: password,

                nombre: nombre,

                fechaInscripcion:
                    fechaInscripcion,

                fechaFin:
                    formatearFecha(
                        fechaFinDate
                    ),

                tipoMembresia:
                    tipo,

                totalClases: 20,

                clasesAsistidas: 0,

                pagoEstado: "Pagada",

                asistencias: []

            };


            usuarios.push(
                nuevoUsuario
            );


            guardarUsuarios();


            document
                .getElementById("registerForm")
                .reset();


            mostrarLogin();


            document
                .getElementById("nit")
                .value = nit;


            document
                .getElementById("password")
                .value = password;


            mostrarMensaje(
                "successMessage",
                "Cuenta creada correctamente. Ya puedes ingresar.",
                "success"
            );

        }
    );


function mostrarDashboard(usuario) {

    document
        .getElementById("loginSection")
        .style.display = "none";


    document
        .getElementById("registerSection")
        .style.display = "none";


    document
        .getElementById("dashboard")
        .style.display = "block";


    document
        .getElementById("nombreUsuario")
        .textContent =
        usuario.nombre.split(" ")[0];


    document
        .getElementById("navNombre")
        .textContent =
        usuario.nombre;


    document
        .getElementById("nombreCompleto")
        .textContent =
        usuario.nombre;


    document
        .getElementById("nitUsuario")
        .textContent =
        usuario.nit;


    document
        .getElementById("fechaInscripcion")
        .textContent =
        usuario.fechaInscripcion;


    document
        .getElementById("fechaFin")
        .textContent =
        usuario.fechaFin;


    document
        .getElementById("tipoMembresia")
        .textContent =
        usuario.tipoMembresia;


    document
        .getElementById("totalClases")
        .textContent =
        usuario.totalClases;


    document
        .getElementById("clasesAsistidas")
        .textContent =
        usuario.clasesAsistidas;


    document
        .getElementById("asistencias")
        .textContent =
        usuario.clasesAsistidas +
        " de " +
        usuario.totalClases;


    const porcentaje =
        usuario.totalClases > 0

            ? Math.min(
                100,
                Math.round(
                    (
                        usuario.clasesAsistidas /
                        usuario.totalClases
                    ) * 100
                )
            )

            : 0;


    document
        .getElementById("porcentaje")
        .textContent =
        porcentaje + "%";


    document
        .getElementById("progressText")
        .textContent =
        porcentaje + "%";


    document
        .getElementById("progress")
        .style.width =
        porcentaje + "%";


    document
        .getElementById("pagoUsuario")
        .textContent =
        usuario.pagoEstado;


    comprobarMembresia(usuario);


    cargarHistorial(
        usuario.asistencias || []
    );

}


function comprobarMembresia(usuario) {

    const fechaVencimiento =
        convertirFecha(
            usuario.fechaFin
        );


    const hoy = new Date();


    hoy.setHours(
        0,
        0,
        0,
        0
    );


    fechaVencimiento.setHours(
        0,
        0,
        0,
        0
    );


    const diferencia =
        fechaVencimiento - hoy;


    const dias =
        Math.ceil(
            diferencia /
            86400000
        );


    const estado =
        document
            .getElementById("estado");


    const alertBox =
        document
            .getElementById("alertBox");


    const diasRestantes =
        document
            .getElementById("diasRestantes");


    const pagada =
        usuario.pagoEstado === "Pagada";


    const vigente =
        dias >= 0;


    const accesoPermitido =
        pagada && vigente;


    if (accesoPermitido) {

        diasRestantes.textContent =
            dias;


        estado.textContent =
            "MEMBRESÍA ACTIVA";


        alertBox.innerHTML = `

            <strong>
                Pago al día
            </strong>

            <p>
                Tu membresía está vigente
                y tu mensualidad está pagada.
                Te quedan
                <b>${dias} días</b>.
            </p>

        `;


        estado.style.color =
            "var(--naranja)";


        document
            .getElementById("pagoUsuario")
            .style.color =
            "var(--verde)";


        document
            .getElementById("pagoUsuario")
            .textContent =
            "Pagada";

    }


    else {

        diasRestantes.textContent =
            "0";


        estado.textContent =
            pagada
                ? "MEMBRESÍA VENCIDA"
                : "PAGO PENDIENTE";


        alertBox.innerHTML = `

            <strong>
                ${
                    pagada
                        ? "Membresía vencida"
                        : "Pago pendiente"
                }
            </strong>

            <p>
                ${
                    pagada
                        ? "Tu membresía terminó."
                        : "Tu mensualidad no está pagada."
                }

                El acceso al gimnasio
                permanece bloqueado hasta
                regularizar tu situación.
            </p>

        `;


        estado.style.color =
            "var(--rojo)";


        document
            .getElementById("pagoUsuario")
            .style.color =
            "var(--rojo)";

    }


    actualizarBotonAcceso(
        accesoPermitido
    );

}


/* =====================================================
   BOTÓN DE ACCESO
===================================================== */

function actualizarBotonAcceso(
    permitido
) {

    const boton =
        document
            .getElementById("accessButton");


    const mensaje =
        document
            .getElementById("accessMessage");


    boton.classList.remove(
        "access-ok",
        "access-blocked"
    );


    if (permitido) {

        boton.textContent =
            "COMPROBAR ACCESO";


        boton.classList.add(
            "access-ok"
        );


        mensaje.textContent =
            "Tu mensualidad está al día. Puedes solicitar el ingreso.";

    }


    else {

        boton.textContent =
            "ACCESO BLOQUEADO";


        boton.classList.add(
            "access-blocked"
        );


        mensaje.textContent =
            "No puedes ingresar mientras tu mensualidad esté pendiente o vencida.";

    }

}


/* =====================================================
   REGISTRAR ENTRADA
===================================================== */

document
    .getElementById("accessButton")
    .addEventListener(
        "click",
        function() {

            if (!usuarioActual) {
                return;
            }


            const fechaFin =
                convertirFecha(
                    usuarioActual.fechaFin
                );


            const hoy = new Date();


            hoy.setHours(
                0,
                0,
                0,
                0
            );


            fechaFin.setHours(
                0,
                0,
                0,
                0
            );


            const permitido =
                usuarioActual.pagoEstado === "Pagada" &&
                fechaFin >= hoy;


            if (!permitido) {

                document
                    .getElementById("accessMessage")
                    .textContent =
                    "✕ ACCESO DENEGADO: debes pagar o renovar tu mensualidad.";


                actualizarBotonAcceso(
                    false
                );

                return;

            }


            const ahora = new Date();


            const nuevaAsistencia = {

                fecha:
                    formatearFecha(
                        ahora
                    ),

                hora:
                    ahora.toLocaleTimeString(
                        "es-BO",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    ),

                actividad:
                    "Ingreso al gimnasio",

                estado:
                    "Presente"

            };


            const asistencias =
                usuarioActual.asistencias || [];


            const yaRegistrado =
                asistencias.some(
                    function(asistencia) {

                        return (
                            asistencia.fecha ===
                            nuevaAsistencia.fecha &&

                            asistencia.actividad ===
                            "Ingreso al gimnasio"
                        );

                    }
                );


            if (!yaRegistrado) {

                usuarioActual.asistencias =
                    asistencias;


                usuarioActual.asistencias.unshift(
                    nuevaAsistencia
                );


                usuarioActual.clasesAsistidas =
                    Math.min(
                        usuarioActual.totalClases,
                        usuarioActual.clasesAsistidas + 1
                    );


                guardarUsuarios();


                mostrarDashboard(
                    usuarioActual
                );

            }


            document
                .getElementById("accessMessage")
                .textContent =
                "✓ Acceso autorizado. Tu entrada quedó registrada.";

        }
    );


/* =====================================================
   HISTORIAL
===================================================== */

function cargarHistorial(
    asistencias
) {

    const tabla =
        document
            .getElementById(
                "tablaAsistencias"
            );


    const vacio =
        document
            .getElementById(
                "emptyHistory"
            );


    tabla.innerHTML = "";


    if (
        !asistencias ||
        asistencias.length === 0
    ) {

        vacio.hidden = false;

        return;

    }


    vacio.hidden = true;


    asistencias.forEach(
        function(asistencia) {

            const fila =
                document.createElement(
                    "tr"
                );


            fila.innerHTML = `

                <td>
                    ${escaparHTML(
                        asistencia.fecha
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        asistencia.hora
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        asistencia.actividad
                    )}
                </td>

                <td>

                    <span
                        class="status-present"
                    >
                        ${escaparHTML(
                            asistencia.estado
                        )}
                    </span>

                </td>

            `;


            tabla.appendChild(
                fila
            );

        }
    );

}


function buscarAsistencia() {

    const texto =
        document
            .getElementById("buscador")
            .value
            .toLowerCase();


    const filas =
        document.querySelectorAll(
            "#tablaAsistencias tr"
        );


    filas.forEach(
        function(fila) {

            const contenido =
                fila.textContent
                    .toLowerCase();


            if (
                contenido.includes(
                    texto
                )
            ) {

                fila.style.display = "";

            }

            else {

                fila.style.display =
                    "none";

            }

        }
    );

}


/* =====================================================
   CERRAR SESIÓN
===================================================== */

function cerrarSesion() {

    usuarioActual = null;


    localStorage.removeItem(
        SESSION_KEY
    );


    document
        .getElementById("dashboard")
        .style.display = "none";


    mostrarLogin();


    document
        .getElementById("loginForm")
        .reset();


    document
        .getElementById("buscador")
        .value = "";


    ocultarMensaje(
        "errorMessage"
    );


    ocultarMensaje(
        "successMessage"
    );

}


/* =====================================================
   MOSTRAR REGISTRO
===================================================== */

function mostrarRegistro() {

    ocultarMensaje(
        "errorMessage"
    );


    ocultarMensaje(
        "successMessage"
    );


    document
        .getElementById("loginSection")
        .style.display = "none";


    document
        .getElementById("registerSection")
        .style.display = "flex";

}


/* =====================================================
   VOLVER AL LOGIN
===================================================== */

function mostrarLogin() {

    document
        .getElementById("registerSection")
        .style.display = "none";


    document
        .getElementById("loginSection")
        .style.display = "flex";

}


/* =====================================================
   SESIÓN PERSISTENTE
===================================================== */

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const nitSesion =
            localStorage.getItem(
                SESSION_KEY
            );


        if (!nitSesion) {
            return;
        }


        const usuario =
            usuarios.find(
                function(user) {

                    return (
                        limpiarNit(user.nit) ===
                        limpiarNit(nitSesion)
                    );

                }
            );


        if (usuario) {

            usuarioActual =
                usuario;


            mostrarDashboard(
                usuario
            );

        }


        else {

            localStorage.removeItem(
                SESSION_KEY
            );

        }

    }
);


/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function limpiarNit(nit) {

    return String(nit)
        .replace(/\D/g, "");

}


function convertirFecha(fecha) {

    const partes =
        fecha.split("/");


    return new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
    );

}


function formatearFecha(fecha) {

    const dia =
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        );


    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return (
        dia +
        "/" +
        mes +
        "/" +
        fecha.getFullYear()
    );

}


function escaparHTML(texto) {

    return String(
        texto ?? ""
    ).replace(
        /[&<>"']/g,
        function(caracter) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[caracter];

        }
    );

}