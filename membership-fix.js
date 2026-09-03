(function () {
    const DAY_MS = 86400000;

    function mesesDe(tipo) {
        const t = String(tipo || '').toLowerCase();
        if (t.includes('semestral')) return 6;
        if (t.includes('trimestral')) return 3;
        return 1;
    }

    function fechaDesdeTexto(texto) {
        const p = String(texto).split('/');
        return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
    }

    function textoFecha(fecha) {
        return String(fecha.getDate()).padStart(2, '0') + '/' + String(fecha.getMonth() + 1).padStart(2, '0') + '/' + fecha.getFullYear();
    }

    function sumarMeses(fechaInicio, meses) {
        const d = new Date(fechaInicio);
        const dia = d.getDate();
        const destino = new Date(d.getFullYear(), d.getMonth() + meses, 1);
        const ultimoDia = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate();
        destino.setDate(Math.min(dia, ultimoDia));
        return destino;
    }

    function clasesAbiertas(inicio, fin) {
        const d = new Date(inicio);
        const f = new Date(fin);
        d.setHours(0, 0, 0, 0);
        f.setHours(0, 0, 0, 0);
        let total = 0;
        while (d < f) {
            if (d.getDay() !== 0) total++;
            d.setDate(d.getDate() + 1);
        }
        return total;
    }

    function actualizarUsuario(usuario) {
        if (!usuario || !usuario.fechaInscripcion) return;
        const inicio = fechaDesdeTexto(usuario.fechaInscripcion);
        if (Number.isNaN(inicio.getTime())) return;
        const fin = sumarMeses(inicio, mesesDe(usuario.tipoMembresia));
        usuario.fechaFin = textoFecha(fin);
        usuario.totalClases = clasesAbiertas(inicio, fin);
        usuario.clasesAsistidas = Math.min(Math.max(0, Number(usuario.clasesAsistidas) || 0), usuario.totalClases);
    }

    function guardar() {
        if (typeof usuarios !== 'undefined') localStorage.setItem('gofit_usuarios', JSON.stringify(usuarios));
    }

    function tiempoRestante(usuario) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fin = fechaDesdeTexto(usuario.fechaFin);
        fin.setHours(0, 0, 0, 0);
        if (fin < hoy) return '0 días';

        if (mesesDe(usuario.tipoMembresia) === 1) {
            const dias = Math.ceil((fin - hoy) / DAY_MS);
            return dias + (dias === 1 ? ' día' : ' días');
        }

        let meses = (fin.getFullYear() - hoy.getFullYear()) * 12 + (fin.getMonth() - hoy.getMonth());
        let base = sumarMeses(hoy, meses);
        if (base > fin) {
            meses--;
            base = sumarMeses(hoy, meses);
        }
        const dias = Math.max(0, Math.ceil((fin - base) / DAY_MS));
        const partes = [];
        if (meses > 0) partes.push(meses + (meses === 1 ? ' mes' : ' meses'));
        if (dias > 0) partes.push(dias + (dias === 1 ? ' día' : ' días'));
        return partes.length ? partes.join(' y ') : '0 días';
    }

    function refrescarDashboard() {
        if (typeof usuarioActual === 'undefined' || !usuarioActual) return;
        actualizarUsuario(usuarioActual);
        guardar();

        const fin = fechaDesdeTexto(usuarioActual.fechaFin);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);
        const pagada = usuarioActual.pagoEstado === 'Pagada';
        const permitido = pagada && fin >= hoy;
        const tiempo = tiempoRestante(usuarioActual);
        const esMensual = mesesDe(usuarioActual.tipoMembresia) === 1;

        const total = document.getElementById('totalClases');
        const fechaFin = document.getElementById('fechaFin');
        const dias = document.getElementById('diasRestantes');
        const etiqueta = dias && dias.previousElementSibling;
        const asistencias = document.getElementById('asistencias');
        const asistidas = document.getElementById('clasesAsistidas');
        const porcentaje = document.getElementById('porcentaje');
        const progressText = document.getElementById('progressText');
        const progress = document.getElementById('progress');
        const alertBox = document.getElementById('alertBox');
        const estado = document.getElementById('estado');
        const pago = document.getElementById('pagoUsuario');
        const accessMessage = document.getElementById('accessMessage');

        if (total) total.textContent = usuarioActual.totalClases;
        if (fechaFin) fechaFin.textContent = usuarioActual.fechaFin;
        if (asistidas) asistidas.textContent = usuarioActual.clasesAsistidas;
        if (asistencias) asistencias.textContent = usuarioActual.clasesAsistidas + ' de ' + usuarioActual.totalClases;

        const pct = usuarioActual.totalClases > 0 ? Math.min(100, Math.round(usuarioActual.clasesAsistidas / usuarioActual.totalClases * 100)) : 0;
        if (porcentaje) porcentaje.textContent = pct + '%';
        if (progressText) progressText.textContent = pct + '%';
        if (progress) progress.style.width = pct + '%';
        if (etiqueta) etiqueta.textContent = esMensual ? 'Días restantes' : 'Tiempo restante';
        if (dias) dias.textContent = permitido ? tiempo : '0';
        if (estado) estado.textContent = permitido ? 'MEMBRESÍA ACTIVA' : (pagada ? 'MEMBRESÍA VENCIDA' : 'PAGO PENDIENTE');

        if (pago) {
            pago.textContent = usuarioActual.pagoEstado;
            pago.style.color = permitido ? 'var(--verde)' : 'var(--rojo)';
        }

        if (alertBox) {
            alertBox.innerHTML = permitido
                ? '<strong>Pago al día</strong><p>Tu membresía está vigente y tu pago está al día. Te quedan <b>' + tiempo + '</b>.</p>'
                : '<strong>' + (pagada ? 'Membresía vencida' : 'Pago pendiente') + '</strong><p>' + (pagada ? 'Tu membresía terminó.' : 'Tu pago no está registrado como pagado.') + ' El acceso al gimnasio permanece bloqueado hasta regularizar tu situación.</p>';
        }

        if (accessMessage) accessMessage.textContent = permitido
            ? 'Tu membresía está al día. Puedes solicitar el ingreso.'
            : 'No puedes ingresar mientras tu membresía esté pendiente o vencida.';

        const boton = document.getElementById('accessButton');
        if (boton) {
            boton.textContent = permitido ? 'COMPROBAR ACCESO' : 'ACCESO BLOQUEADO';
            boton.classList.toggle('access-ok', permitido);
            boton.classList.toggle('access-blocked', !permitido);
        }
    }

    function actualizarTodos() {
        if (typeof usuarios === 'undefined' || !Array.isArray(usuarios)) return;
        usuarios.forEach(actualizarUsuario);
        guardar();
    }

    document.addEventListener('DOMContentLoaded', function () {
        actualizarTodos();
        setTimeout(refrescarDashboard, 0);
    });

    const registro = document.getElementById('registerForm');
    if (registro) {
        registro.addEventListener('submit', function () {
            setTimeout(function () {
                if (typeof usuarios !== 'undefined' && usuarios.length) {
                    const usuario = usuarios[usuarios.length - 1];
                    actualizarUsuario(usuario);
                    guardar();
                }
            }, 0);
        });
    }

    const login = document.getElementById('loginForm');
    if (login) {
        login.addEventListener('submit', function () {
            setTimeout(function () {
                if (typeof usuarioActual !== 'undefined' && usuarioActual) {
                    actualizarUsuario(usuarioActual);
                    guardar();
                    refrescarDashboard();
                }
            }, 0);
        });
    }
})();
