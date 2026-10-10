document.addEventListener("DOMContentLoaded", () => {
    const pacientes = Array.isArray(window.PACIENTES_SMILE_CLOUD) ? window.PACIENTES_SMILE_CLOUD : [];
    let pacienteActual = null;
    let estadoSeleccionado = "sano";
    let colorSeleccionado = "#8bcf50";
    const estadoOdontograma = {};

    const superiores = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
    const inferiores = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

    const nombres = {
        18:"Tercer molar superior derecho",17:"Segundo molar superior derecho",16:"Primer molar superior derecho",
        15:"Segundo premolar superior derecho",14:"Primer premolar superior derecho",13:"Canino superior derecho",
        12:"Incisivo lateral superior derecho",11:"Incisivo central superior derecho",
        21:"Incisivo central superior izquierdo",22:"Incisivo lateral superior izquierdo",23:"Canino superior izquierdo",
        24:"Primer premolar superior izquierdo",25:"Segundo premolar superior izquierdo",26:"Primer molar superior izquierdo",
        27:"Segundo molar superior izquierdo",28:"Tercer molar superior izquierdo",
        48:"Tercer molar inferior derecho",47:"Segundo molar inferior derecho",46:"Primer molar inferior derecho",
        45:"Segundo premolar inferior derecho",44:"Primer premolar inferior derecho",43:"Canino inferior derecho",
        42:"Incisivo lateral inferior derecho",41:"Incisivo central inferior derecho",
        31:"Incisivo central inferior izquierdo",32:"Incisivo lateral inferior izquierdo",33:"Canino inferior izquierdo",
        34:"Primer premolar inferior izquierdo",35:"Segundo premolar inferior izquierdo",36:"Primer molar inferior izquierdo",
        37:"Segundo molar inferior izquierdo",38:"Tercer molar inferior izquierdo"
    };

    const nombresEstado = {
        sano:"Sano", caries:"Caries", obturacion:"Obturación", corona:"Corona",
        conducto:"Tratamiento de conducto", sellante:"Sellante", fractura:"Fractura",
        implante:"Implante", extraccion:"Extracción", ausente:"Diente ausente"
    };

    // Clave local de la historia clínica del paciente seleccionado.
    const claveHistoria = () => {
        if (!pacienteActual) return null;
        const id = pacienteActual.id_paciente ?? pacienteActual.id;
        return id ? `smilecloud_historia_${id}` : null;
    };

    // Pestañas
    document.querySelectorAll(".hc-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".hc-tab").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".hc-panel").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            const panel = document.getElementById("tab-" + btn.dataset.tab);
            if (panel) panel.classList.add("active");
        });
    });

    // Fecha
    const fecha = new Date().toLocaleDateString("es-CO");
    const fechaEl = document.getElementById("odo-fecha");
    if (fechaEl) fechaEl.textContent = fecha;
    const fechaConsulta = document.getElementById("fecha-consulta");
    if (fechaConsulta) fechaConsulta.value = new Date().toISOString().slice(0, 10);

    // Buscar paciente
    const buscarPaciente = () => {
        const valor = document.getElementById("buscar-documento").value.trim();
        const mensaje = document.getElementById("mensaje-busqueda");
        let encontrado = pacientes.find(p =>
            String(p.id_paciente ?? p.id ?? "") === valor ||
            String(p.numero_documento ?? p.documento ?? "") === valor
        );

        if (!encontrado && valor) {
            encontrado = pacientes.find(p =>
                `${p.nombre ?? ""} ${p.apellido ?? ""}`.toLowerCase().includes(valor.toLowerCase())
            );
        }

        if (!encontrado) {
            mensaje.textContent = valor ? "Paciente no encontrado. Puedes buscar por ID o nombre en la versión actual del proyecto." : "Ingrese un dato para buscar.";
            mensaje.className = "hc-error";
            return;
        }

        pacienteActual = encontrado;
        document.getElementById("paciente-nombre").value = `${encontrado.nombre || ""} ${encontrado.apellido || ""}`.trim();
        document.getElementById("paciente-documento").value = encontrado.numero_documento || encontrado.documento || `ID ${encontrado.id_paciente ?? encontrado.id}`;
        document.getElementById("paciente-telefono").value = encontrado.telefono || "";
        document.getElementById("paciente-correo").value = encontrado.correo || "";
        document.getElementById("paciente-tratamiento").value = encontrado.tratamiento || "";
        document.getElementById("paciente-especialista").value = encontrado.especialista || "";

        document.getElementById("odo-paciente-nombre").textContent = `${encontrado.nombre || ""} ${encontrado.apellido || ""}`.trim();
        document.getElementById("odo-paciente-documento").textContent = encontrado.numero_documento || encontrado.documento || `ID ${encontrado.id_paciente ?? encontrado.id}`;
        mensaje.textContent = "Paciente cargado correctamente.";
        mensaje.className = "hc-success";
        cargarHistoriaLocal();
    };

    document.getElementById("btn-buscar-paciente").addEventListener("click", buscarPaciente);
    document.getElementById("buscar-documento").addEventListener("keydown", e => {
        if (e.key === "Enter") buscarPaciente();
    });

    // ======================================================
    // IMPRESIÓN DE HISTORIA CLÍNICA
    // Genera un documento limpio, independiente de la interfaz,
    // con el formato formal de historia clínica odontológica.
    // ======================================================
    const escPrint = value => String(value ?? "").replace(/[&<>"']/g, c => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[c]));

    const textoLista = (valores, vacio = "No registrado") => {
        if (!Array.isArray(valores) || !valores.length) return vacio;
        return valores.map(escPrint).join(", ");
    };

    function imprimirHistoriaClinica() {
        if (!pacienteActual) {
            alert("Primero busca y selecciona un paciente.");
            return;
        }

        // Recupera los datos guardados y toma también los valores actuales
        // de pantalla para que se pueda imprimir sin volver a guardar.
        let data = {};
        try {
            const raw = localStorage.getItem(claveHistoria());
            data = raw ? JSON.parse(raw) : {};
        } catch { data = {}; }

        const nombre = `${pacienteActual.nombre ?? ""} ${pacienteActual.apellido ?? ""}`.trim();
        const documento = pacienteActual.numero_documento ?? pacienteActual.documento ?? "";
        const getValue = id => document.getElementById(id)?.value?.trim() || data[id] || "";
        const getChecks = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(i => i.value);
        const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";
        const getSelect = id => Array.from(document.getElementById(id)?.selectedOptions || []).map(o => o.value);

        const motivos = getChecks("motivo").length ? getChecks("motivo") : (data.motivoConsulta || []);
        const sintomas = getChecks("sintoma").length ? getChecks("sintoma") : (data.sintomas || []);
        const antecedentes = getChecks("antecedente").length ? getChecks("antecedente") : (data.antecedentes || []);
        const alergias = getRadio("alergias") || data.alergias || "";
        const tipoAlergias = getChecks("tipo-alergia").length ? getChecks("tipo-alergia") : (data.tipoAlergias || []);
        const diagnosticos = getSelect("diagnostico").length ? getSelect("diagnostico") : (data.diagnosticos || []);
        const tratamientos = getSelect("tratamiento").length ? getSelect("tratamiento") : (data.procedimientos || []);
        const intensidad = getRadio("intensidad-dolor") || data.intensidadDolor || "";

        const estadosOdonto = Object.entries(estadoOdontograma);
        const dientesMarcados = estadosOdonto.map(([key, value]) => {
            const [diente] = key.split("-");
            return `${diente}: ${nombresEstado[value.estado] || value.estado}`;
        });

        const evoluciones = Array.from(document.querySelectorAll("#lista-evoluciones .hc-evolution")).map(item => ({
            fecha: item.querySelector("strong")?.textContent || "",
            texto: item.querySelector("p")?.textContent || ""
        }));

        const fila = (label, value) => `<div class="hc-print-field"><span>${escPrint(label)}</span><strong>${escPrint(value || "No registrado")}</strong></div>`;
        const seccion = (titulo, contenido) => `<section class="hc-print-section"><h2>${escPrint(titulo)}</h2>${contenido}</section>`;

        const html = `
        <article class="hc-print-doc">
            <header class="hc-print-header">
                <div>
                    <div class="hc-print-clinic">SMILE CLOUD</div>
                    <h1>HISTORIA CLÍNICA ODONTOLÓGICA</h1>
                    <p>Registro clínico del paciente</p>
                </div>
                <div class="hc-print-code">Historia clínica</div>
            </header>

            ${seccion("Datos del paciente", `<div class="hc-print-grid">
                ${fila("Nombre completo", nombre)}
                ${fila("Documento", documento)}
                ${fila("Sexo", pacienteActual.sexo)}
                ${fila("Fecha de nacimiento", pacienteActual.fecha_nacimiento)}
                ${fila("Teléfono", pacienteActual.telefono)}
                ${fila("Correo electrónico", pacienteActual.correo)}
                ${fila("Dirección", pacienteActual.direccion)}
                ${fila("EPS", pacienteActual.eps)}
                ${fila("Tratamiento", pacienteActual.tratamiento)}
                ${fila("Especialista", pacienteActual.especialista)}
            </div>`)}

            ${seccion("Consulta odontológica", `<div class="hc-print-grid">
                ${fila("Fecha de consulta", getValue("fecha-consulta"))}
                ${fila("Próximo control", getValue("proximo-control"))}
                ${fila("Motivo de consulta", textoLista(motivos))}
                ${fila("Síntomas", textoLista(sintomas))}
                ${fila("Intensidad del dolor", intensidad)}
                ${fila("Antecedentes médicos", textoLista(antecedentes))}
                ${fila("Alergias", alergias)}
                ${fila("Tipo de alergias", textoLista(tipoAlergias))}
            </div>
            <div class="hc-print-text"><span>Observaciones clínicas</span><p>${escPrint(getValue("observaciones-clinicas") || "No registrado")}</p></div>`)}

            ${seccion("Diagnóstico y tratamiento", `<div class="hc-print-grid">
                ${fila("Diagnóstico", textoLista(diagnosticos))}
                ${fila("Tratamiento / procedimientos", textoLista(tratamientos))}
            </div>`)}

            ${seccion("Ficha de anamnesis", `<div class="hc-print-text-grid">
                <div><span>Alergias</span><p>${escPrint(getValue("anamnesis-alergias") || "No registrado")}</p></div>
                <div><span>Enfermedades</span><p>${escPrint(getValue("anamnesis-enfermedades") || "No registrado")}</p></div>
                <div><span>Medicamentos</span><p>${escPrint(getValue("anamnesis-medicamentos") || "No registrado")}</p></div>
                <div><span>Cirugías / antecedentes importantes</span><p>${escPrint(getValue("anamnesis-cirugias") || "No registrado")}</p></div>
            </div>`)}

            ${seccion("Odontograma", `<div class="hc-print-text">
                <span>Hallazgos registrados</span>
                <p>${escPrint(dientesMarcados.length ? dientesMarcados.join(" • ") : "No se han registrado hallazgos en el odontograma.")}</p>
                <span>Observaciones</span>
                <p>${escPrint(getValue("odontograma-observaciones") || "No registrado")}</p>
            </div>`)}

            ${seccion("Evoluciones clínicas", evoluciones.length ? evoluciones.map(e => `<div class="hc-print-evolution"><strong>${escPrint(e.fecha)}</strong><p>${escPrint(e.texto)}</p></div>`).join("") : `<p class="hc-print-empty">No hay evoluciones registradas.</p>`)}

            <footer class="hc-print-footer">
                <div>${fila("Fecha de impresión", new Date().toLocaleDateString("es-CO"))}</div>
                <div class="hc-print-signature"><div></div><span>Firma del profesional</span><strong>${escPrint(pacienteActual.especialista || "")}</strong></div>
            </footer>
        </article>`;

        imprimirHTMLDocumento(html, "Historia clínica odontológica");
    }

    document.getElementById("btn-imprimir-historial")?.addEventListener("click", imprimirHistoriaClinica);

    // Odontograma
    function crearCara(numero, nombreCara, diente) {
        const cara = document.createElement("button");
        cara.type = "button";
        cara.className = "odo-face";
        cara.dataset.cara = numero;
        cara.title = nombreCara;
        cara.textContent = numero;
        cara.addEventListener("click", e => {
            e.stopPropagation();
            const key = `${diente}-${numero}`;
            estadoOdontograma[key] = { estado: estadoSeleccionado, color: colorSeleccionado };
            cara.style.backgroundColor = colorSeleccionado;
            cara.dataset.estado = estadoSeleccionado;
            document.getElementById("cara-seleccionada").textContent = `${numero} - ${nombreCara}`;
            document.getElementById("estado-actual").textContent = nombresEstado[estadoSeleccionado];
            document.getElementById("info-id").textContent = "D" + diente;
            document.getElementById("info-numero").textContent = diente;
            document.getElementById("info-nombre").textContent = nombres[diente];
        });
        return cara;
    }

    function crearDiente(numero) {
        const diente = document.createElement("div");
        diente.className = "odo-tooth";
        const label = document.createElement("div");
        label.className = "odo-number";
        label.textContent = numero;

        const caras = document.createElement("div");
        caras.className = "odo-faces";
        const carasDatos = [
            [1, "Oclusal / Incisal"], [2, "Vestibular / Facial"], [3, "Distal"],
            [4, "Lingual / Palatina"], [5, "Mesial"]
        ];
        carasDatos.forEach(([n, nombre]) => caras.appendChild(crearCara(n, nombre, numero)));

        diente.append(label, caras);
        diente.addEventListener("click", () => {
            document.getElementById("info-id").textContent = "D" + numero;
            document.getElementById("info-numero").textContent = numero;
            document.getElementById("info-nombre").textContent = nombres[numero];
            document.getElementById("cara-seleccionada").textContent = "Ninguna";
            document.getElementById("estado-actual").textContent = "-";
        });
        return diente;
    }

    function generarDientes(contenedorId, lista) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;
        contenedor.innerHTML = "";
        lista.forEach(numero => contenedor.appendChild(crearDiente(numero)));
    }
    generarDientes("dientes-superiores", superiores);
    generarDientes("dientes-inferiores", inferiores);

    document.querySelectorAll(".odo-state").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".odo-state").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            estadoSeleccionado = btn.dataset.estado;
            colorSeleccionado = btn.dataset.color;
        });
    });

    // Guardar localmente la historia para que funcione sin conexión.
// ======================================================
// HISTORIA CLÍNICA
// ======================================================

const camposHistoria = [
    "observaciones-clinicas",
    "fecha-consulta",
    "proximo-control",
    "anamnesis-alergias",
    "anamnesis-enfermedades",
    "anamnesis-medicamentos",
    "anamnesis-cirugias",
    "odontograma-observaciones"
];


// Obtener valores de varios checkbox
function obtenerCheckbox(nombre) {
    return Array.from(
        document.querySelectorAll(`input[name="${nombre}"]:checked`)
    ).map(el => el.value);
}


// Obtener valores de un radio
function obtenerRadio(nombre) {
    const seleccionado = document.querySelector(
        `input[name="${nombre}"]:checked`
    );

    return seleccionado ? seleccionado.value : "";
}


// Obtener valores de select múltiple
function obtenerSelectMultiple(id) {
    const select = document.getElementById(id);

    if (!select) return [];

    return Array.from(select.selectedOptions).map(option => option.value);
}


// Guardar historia
function guardarHistoriaLocal() {

    if (!pacienteActual) {
        alert("Primero busca y selecciona un paciente.");
        return;
    }

    const data = {};

    // Campos normales
    camposHistoria.forEach(id => {
        const el = document.getElementById(id);

        if (el) {
            data[id] = el.value;
        }
    });


    // Campos rápidos
    data.motivoConsulta = obtenerCheckbox("motivo");

    data.sintomas = obtenerCheckbox("sintoma");

    data.intensidadDolor = obtenerRadio("intensidad-dolor");

    data.antecedentes = obtenerCheckbox("antecedente");

    data.alergias = obtenerRadio("alergias");

    data.tipoAlergias = obtenerCheckbox("tipo-alergia");


    // Diagnóstico y tratamiento
    data.diagnosticos = obtenerSelectMultiple("diagnostico");

    data.procedimientos = obtenerSelectMultiple("tratamiento");


    // Odontograma
    // NO SE MODIFICA SU FUNCIONAMIENTO
    data.odontograma = estadoOdontograma;


    localStorage.setItem(
        claveHistoria(),
        JSON.stringify(data)
    );


    alert("Historia clínica guardada correctamente en este equipo.");
}


// Cargar historia
function cargarHistoriaLocal() {

    const key = claveHistoria();

    if (!key) return;

    const raw = localStorage.getItem(key);

    if (!raw) return;

    const data = JSON.parse(raw);


    // Campos normales
    camposHistoria.forEach(id => {

        const el = document.getElementById(id);

        if (el && data[id] !== undefined) {
            el.value = data[id];
        }

    });


    // Restaurar checkbox
    function restaurarCheckbox(nombre, valores) {

        document
            .querySelectorAll(`input[name="${nombre}"]`)
            .forEach(el => {

                el.checked = Array.isArray(valores)
                    ? valores.includes(el.value)
                    : false;

            });

    }


    restaurarCheckbox("motivo", data.motivoConsulta);

    restaurarCheckbox("sintoma", data.sintomas);

    restaurarCheckbox("antecedente", data.antecedentes);

    restaurarCheckbox("tipo-alergia", data.tipoAlergias);


    // Restaurar radio
    function restaurarRadio(nombre, valor) {

        document
            .querySelectorAll(`input[name="${nombre}"]`)
            .forEach(el => {

                el.checked = el.value === valor;

            });

    }


    restaurarRadio("intensidad-dolor", data.intensidadDolor);

    restaurarRadio("alergias", data.alergias);


    // Restaurar diagnóstico
    const diagnostico = document.getElementById("diagnostico");

    if (diagnostico && Array.isArray(data.diagnosticos)) {

        Array.from(diagnostico.options).forEach(option => {

            option.selected =
                data.diagnosticos.includes(option.value);

        });

    }


    // Restaurar tratamiento
    const tratamiento = document.getElementById("tratamiento");

    if (tratamiento && Array.isArray(data.procedimientos)) {

        Array.from(tratamiento.options).forEach(option => {

            option.selected =
                data.procedimientos.includes(option.value);

        });

    }


    // Mostrar u ocultar alergias
    actualizarAlergias();

    // Mostrar u ocultar intensidad
    actualizarIntensidadDolor();


    // ================================
    // ODONTOGRAMA
    // ================================

    Object.keys(estadoOdontograma)
        .forEach(k => delete estadoOdontograma[k]);

    Object.assign(
        estadoOdontograma,
        data.odontograma || {}
    );


    document
        .querySelectorAll(".odo-face")
        .forEach(cara => {

            const tooth =
                cara.closest(".odo-tooth");

            const numero =
                tooth?.querySelector(".odo-number")?.textContent;

            const keyCara =
                `${numero}-${cara.dataset.cara}`;

            const estado =
                estadoOdontograma[keyCara];

            cara.style.backgroundColor =
                estado ? estado.color : "";

        });

}


// ======================================================
// CAMPOS DINÁMICOS
// ======================================================


// Mostrar intensidad del dolor
function actualizarIntensidadDolor() {

    const dolorSeleccionado =
        Array.from(
            document.querySelectorAll('input[name="sintoma"]:checked')
        ).some(el => el.value === "Dolor");

    const contenedor =
        document.getElementById("intensidad-dolor");

    if (contenedor) {

        contenedor.style.display =
            dolorSeleccionado ? "block" : "none";

    }

}


// Mostrar alergias
function actualizarAlergias() {

    const alergias =
        document.querySelector('input[name="alergias"]:checked');

    const contenedor =
        document.getElementById("lista-alergias");

    if (contenedor) {

        contenedor.style.display =
            alergias && alergias.value === "Sí"
                ? "block"
                : "none";

    }

}


// Eventos síntomas
document
    .querySelectorAll('input[name="sintoma"]')
    .forEach(input => {

        input.addEventListener(
            "change",
            actualizarIntensidadDolor
        );

    });


// Eventos alergias
document
    .querySelectorAll('input[name="alergias"]')
    .forEach(input => {

        input.addEventListener(
            "change",
            actualizarAlergias
        );

    });


// ======================================================
// LIMPIAR
// ======================================================

document
    .getElementById("btn-limpiar")
    .addEventListener("click", () => {

        // Campos normales
        camposHistoria.forEach(id => {

            const el =
                document.getElementById(id);

            if (el) {
                el.value = "";
            }

        });


        // Checkbox
        document
            .querySelectorAll(
                'input[type="checkbox"]'
            )
            .forEach(el => {

                el.checked = false;

            });


        // Radio
        document
            .querySelectorAll(
                'input[type="radio"]'
            )
            .forEach(el => {

                el.checked = false;

            });


        // Select múltiple
        document
            .querySelectorAll(
                'select[multiple]'
            )
            .forEach(select => {

                Array.from(select.options)
                    .forEach(option => {

                        option.selected = false;

                    });

            });


        actualizarAlergias();
        actualizarIntensidadDolor();

    });


document
    .getElementById("btn-guardar")
    .addEventListener(
        "click",
        guardarHistoriaLocal
    );

    // Evoluciones
    document.getElementById("btn-agregar-evolucion").addEventListener("click", () => {
        if (!pacienteActual) {
            alert("Primero busca un paciente.");
            return;
        }
        const texto = prompt("Escribe la evolución clínica:");
        if (!texto || !texto.trim()) return;
        const lista = document.getElementById("lista-evoluciones");
        lista.querySelector(".hc-empty")?.remove();
        const item = document.createElement("article");
        item.className = "hc-evolution";
        item.innerHTML = `<strong>${new Date().toLocaleDateString("es-CO")}</strong><p></p>`;
        item.querySelector("p").textContent = texto.trim();
        lista.prepend(item);
    });

    document.getElementById("archivo-rx").addEventListener("change", e => {
        const lista = document.getElementById("lista-archivos");
        lista.innerHTML = "";
        Array.from(e.target.files).forEach(file => {
            const div = document.createElement("div");
            div.className = "hc-file";
            div.textContent = `📎 ${file.name}`;
            lista.appendChild(div);
        });
    });

    document.querySelectorAll(".hc-document").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("mensaje-documento").textContent =
                `${btn.dataset.doc}: opción seleccionada.`;
        });
    });

    // =====================================================================
    // CONSENTIMIENTOS INFORMADOS
    // Los textos están en el objeto CONSENTIMIENTOS: si la clínica entrega
    // sus propios formatos, basta con reemplazar el contenido de "texto".
    // Se pueden usar {nombre}, {documento}, {profesional} y el id de cada
    // campo adicional (por ejemplo {procedimiento}).
    // =====================================================================
    const CONSENTIMIENTOS = {
        anestesia: {
            titulo: "Consentimiento informado para anestesia",
            icono: "💉",
            resumen: "Anestesia local, con sedación o general",
            campos: [
                { id: "tipo_anestesia", etiqueta: "Tipo de anestesia", tipo: "select", opciones: ["Local", "Local con sedación consciente", "General"] },
                { id: "procedimiento", etiqueta: "Procedimiento en el que se aplica", tipo: "text" }
            ],
            texto: [
                "El profesional {profesional} me explicó, en lenguaje claro, que para realizar el procedimiento odontológico ({procedimiento}) se requiere anestesia de tipo {tipo_anestesia}, cuyo fin es eliminar o disminuir el dolor y la ansiedad durante la atención.",
                "Me informaron que, aunque se aplica con todas las medidas de seguridad, pueden presentarse riesgos como: adormecimiento temporal de labio, lengua o mejilla; dolor, moretón o inflamación en el sitio de la punción; mordedura accidental de los tejidos adormecidos; mareo o desmayo; reacciones alérgicas al anestésico; alteraciones de la presión arterial o del ritmo del corazón; y, en casos poco frecuentes, lesión de un nervio con alteración prolongada de la sensibilidad. Con sedación o anestesia general pueden presentarse además náuseas, vómito, depresión respiratoria y otras complicaciones que exigen vigilancia especializada.",
                "Informé de manera veraz mis alergias, enfermedades, medicamentos que consumo, embarazo o lactancia (si aplica), consumo de alcohol, tabaco u otras sustancias, y mis antecedentes con anestesias anteriores.",
                "Me explicaron las alternativas (realizar el procedimiento sin anestesia o aplazarlo) y las consecuencias de no recibirla.",
                "Entiendo que debo seguir las indicaciones dadas: cumplir el ayuno cuando se indique, asistir con un acompañante adulto si se usa sedación o anestesia general, y no comer ni masticar hasta recuperar la sensibilidad.",
                "Tuve la oportunidad de hacer preguntas y fueron resueltas a mi satisfacción. Sé que puedo retirar este consentimiento en cualquier momento antes del procedimiento, sin que ello afecte mi atención."
            ]
        },
        cirugia: {
            titulo: "Consentimiento informado para cirugía",
            icono: "🦷",
            resumen: "Procedimientos quirúrgicos odontológicos",
            campos: [
                { id: "procedimiento", etiqueta: "Procedimiento quirúrgico", tipo: "text", ancho: "completo" },
                { id: "zona", etiqueta: "Diente o zona a intervenir", tipo: "text" }
            ],
            texto: [
                "El profesional {profesional} me explicó mi diagnóstico y el procedimiento quirúrgico odontológico que se me realizará: {procedimiento}, en la zona {zona}, así como su finalidad y los beneficios esperados.",
                "Me informaron los riesgos y posibles complicaciones, entre ellos: dolor, inflamación, moretones y sangrado posoperatorios; infección; alveolitis (\"hueso seco\"); lesión de dientes, raíces, encías o tejidos vecinos; fractura de dientes, raíces o hueso; comunicación con el seno maxilar; lesión de nervios con adormecimiento temporal o, rara vez, permanente de labio, lengua o mentón; limitación temporal para abrir la boca; cicatrización lenta o complicada; y reacciones a los medicamentos.",
                "Comprendo que la odontología no es una ciencia exacta, que el resultado depende también de mi respuesta biológica y de mis cuidados, y que no es posible garantizar un resultado específico.",
                "Me explicaron las alternativas de tratamiento, incluida la de no realizar la cirugía, y los riesgos de cada una.",
                "Autorizo al equipo tratante a modificar la técnica o a realizar procedimientos adicionales si durante la cirugía se presentan hallazgos imprevistos o una urgencia que lo requiera para proteger mi salud.",
                "Me comprometo a seguir las indicaciones antes y después de la cirugía (medicación, dieta, higiene, reposo y controles) y a informar cualquier síntoma anormal. Entiendo que el uso de anestesia se autoriza con su consentimiento independiente.",
                "Mis preguntas fueron resueltas y sé que puedo retirar este consentimiento antes del procedimiento."
            ]
        },
        imagen: {
            titulo: "Autorización para uso de imagen y grabación de consultas",
            icono: "🎥",
            resumen: "Fotografías y grabación de consultas",
            campos: [
                { id: "medios", etiqueta: "Qué se autoriza captar", tipo: "checks", opciones: ["Fotografías", "Video o grabación de la consulta"] },
                { id: "alcance", etiqueta: "Para qué se pueden usar", tipo: "checks", opciones: ["Registro en la historia clínica (uso clínico)", "Fines académicos y científicos, sin identificar al paciente", "Divulgación de la clínica (redes sociales, página web)"] }
            ],
            texto: [
                "Fui informado(a) de que algunas consultas y procedimientos en la clínica Smile Cloud pueden ser fotografiados o grabados, y de que estas imágenes son datos personales sensibles por estar relacionadas con mi salud.",
                "Autorizo captar: {medios}. Y autorizo su uso únicamente para: {alcance}.",
                "El tratamiento de estas imágenes se hará conforme a la Ley 1581 de 2012 y a la política de tratamiento de datos de la clínica. Se almacenarán con medidas de seguridad y confidencialidad y no se entregarán a terceros sin mi autorización, salvo mandato legal.",
                "Esta autorización es voluntaria: puedo negarme sin que se afecte mi atención, y puedo revocarla en cualquier momento por escrito, en cuyo caso la clínica dejará de usar las imágenes para los fines que ya no autorice.",
                "Sé que puedo conocer, actualizar, rectificar y solicitar la supresión de mis datos e imágenes escribiendo a la clínica, y que esta autorización no genera ninguna contraprestación económica."
            ]
        },
        menores: {
            titulo: "Consentimiento informado para menores de edad",
            icono: "🧒",
            resumen: "Atención de pacientes menores, firma el representante legal",
            forzarRepresentante: true,
            campos: [
                { id: "fecha_nacimiento", etiqueta: "Fecha de nacimiento del menor", tipo: "date" },
                { id: "procedimiento", etiqueta: "Tratamiento o procedimiento autorizado", tipo: "text" },
                { id: "asentimiento", etiqueta: "Asentimiento del menor", tipo: "select", ancho: "completo", opciones: ["El menor fue informado y manifestó su asentimiento", "El menor no tiene edad o madurez suficiente para asentir"] }
            ],
            texto: [
                "El profesional {profesional} me explicó de forma clara el diagnóstico del menor y el tratamiento o procedimiento propuesto: {procedimiento}.",
                "Me informaron los beneficios esperados, los riesgos habituales y posibles complicaciones, las alternativas de tratamiento (incluida la de no tratar) y las consecuencias de no realizarlo.",
                "Informé con veracidad los antecedentes médicos, alergias, medicamentos y condiciones de salud del menor.",
                "Asentimiento del menor: {asentimiento}. Se le explicó la atención con palabras acordes a su edad y madurez, y se respetará su participación en lo posible.",
                "Cuando el procedimiento requiera anestesia, cirugía o uso de imagen, firmaré los consentimientos específicos correspondientes.",
                "Me comprometo a acompañar al menor cuando la clínica lo exija y a seguir las indicaciones dadas. Sé que puedo retirar esta autorización antes del procedimiento."
            ]
        }
    };

    const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const valorDe = id => (document.getElementById(id)?.value || "").trim();
    const fechaLegible = iso => iso ? iso.split("-").reverse().join("/") : "";
    const blanco = v => (v && String(v).trim()) ? `<strong>${esc(v)}</strong>` : `<span class="cs-blanco"></span>`;

    let tipoConsentimiento = null;
    let modoFirma = "digital";

    // ---------- Firma en pantalla ----------
    function crearPad(canvas) {
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1c2b2d";
        let dibujando = false;
        let vacio = true;

        const punto = e => {
            const r = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - r.left) * canvas.width / r.width,
                y: (e.clientY - r.top) * canvas.height / r.height
            };
        };

        canvas.addEventListener("pointerdown", e => {
            e.preventDefault();
            canvas.setPointerCapture(e.pointerId);
            dibujando = true;
            vacio = false;
            const p = punto(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 0.1, p.y);
            ctx.stroke();
        });
        canvas.addEventListener("pointermove", e => {
            if (!dibujando) return;
            const p = punto(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        });
        ["pointerup", "pointercancel", "pointerleave"].forEach(ev =>
            canvas.addEventListener(ev, () => { dibujando = false; })
        );

        return {
            limpiar() { ctx.clearRect(0, 0, canvas.width, canvas.height); vacio = true; },
            estaVacio: () => vacio,
            imagen: () => canvas.toDataURL("image/png")
        };
    }

    const padFirmante = crearPad(document.getElementById("cs-canvas-firmante"));
    const padProfesional = crearPad(document.getElementById("cs-canvas-profesional"));
    document.querySelectorAll("[data-limpiar]").forEach(btn => {
        btn.addEventListener("click", () => {
            (btn.dataset.limpiar === "firmante" ? padFirmante : padProfesional).limpiar();
        });
    });

    // ---------- Lectura del formulario ----------
    function firmaOtraPersona() {
        const cfg = CONSENTIMIENTOS[tipoConsentimiento];
        return !!(cfg && cfg.forzarRepresentante) || document.getElementById("cs-otro-firmante").checked;
    }

    function leerDatos() {
        const cfg = CONSENTIMIENTOS[tipoConsentimiento];
        const otro = firmaOtraPersona();
        const extras = {};
        cfg.campos.forEach(c => {
            if (c.tipo === "checks") {
                extras[c.id] = Array.from(document.querySelectorAll(`#cs-x-${c.id} input:checked`)).map(i => i.value);
            } else {
                extras[c.id] = valorDe(`cs-x-${c.id}`);
            }
        });
        const decision = document.querySelector('input[name="cs-decision"]:checked');
        return {
            tipo: tipoConsentimiento,
            paciente: valorDe("cs-paciente-nombre"),
            documento: valorDe("cs-paciente-documento"),
            profesional: valorDe("cs-profesional"),
            fecha: valorDe("cs-fecha"),
            firmanteOtro: otro,
            firmante: otro ? valorDe("cs-firmante-nombre") : valorDe("cs-paciente-nombre"),
            firmanteDoc: otro ? valorDe("cs-firmante-doc") : valorDe("cs-paciente-documento"),
            parentesco: otro ? valorDe("cs-firmante-parentesco") : "",
            extras,
            decision: decision ? decision.value : ""
        };
    }

    // ---------- Documento (vista previa, impresión y registros guardados) ----------
    function htmlDocumento(d, firmas = {}, opciones = {}) {
        const cfg = CONSENTIMIENTOS[d.tipo];
        const logo = document.getElementById("cs-print-root")?.dataset.logo || "";

        const vars = { nombre: d.paciente, documento: d.documento, profesional: d.profesional };
        cfg.campos.forEach(c => {
            const v = d.extras[c.id];
            vars[c.id] = Array.isArray(v) ? v.join("; ") : (c.tipo === "date" ? fechaLegible(v) : v);
        });

        const calidad = d.firmanteOtro
            ? `en calidad de ${blanco(d.parentesco)} y representante legal del paciente ${blanco(d.paciente)} (documento de identidad No. ${blanco(d.documento)})`
            : "en calidad de paciente";

        const parrafos = cfg.texto
            .map(p => `<li>${p.replace(/\{(\w+)\}/g, (_, k) => blanco(vars[k]))}</li>`)
            .join("");

        const marca = v => d.decision === v ? "☒" : "☐";
        const rotuloFirmante = d.firmanteOtro ? "Representante legal" : "Paciente";

        const bloqueFirma = (rotulo, nombre, doc, img) => `
            <div class="cs-doc-firma">
                <div class="cs-doc-firma-area">${img ? `<img src="${img}" alt="Firma">` : ""}</div>
                <div class="cs-doc-firma-linea">Firma ${esc(rotulo)}</div>
                <div class="cs-doc-firma-dato">Nombre: ${blanco(nombre)}</div>
                <div class="cs-doc-firma-dato">Documento: ${blanco(doc)}</div>
            </div>`;

        const digital = !!firmas.firmante;
        const mostrarTestigo = !digital;

        return `
        <article class="cs-doc">
            <header class="cs-doc-cabecera">
                ${logo ? `<img src="${esc(logo)}" alt="Smile Cloud" class="cs-doc-logo">` : ""}
                <div>
                    <div class="cs-doc-clinica">Smile Cloud</div>
                    <h1>${esc(cfg.titulo)}</h1>
                </div>
            </header>
            <div class="cs-doc-datos">
                <div><span>Paciente</span>${blanco(d.paciente)}</div>
                <div><span>Documento</span>${blanco(d.documento)}</div>
                <div><span>Fecha</span>${blanco(fechaLegible(d.fecha))}</div>
                <div><span>Profesional</span>${blanco(d.profesional)}</div>
            </div>
            <p class="cs-doc-intro">Yo, ${blanco(d.firmante)}, identificado(a) con documento de identidad No. ${blanco(d.firmanteDoc)}, ${calidad}, declaro que:</p>
            <ol class="cs-doc-lista">${parrafos}</ol>
            <p class="cs-doc-decision"><strong>Decisión:</strong> &nbsp; ${marca("Autorizo")} Autorizo &nbsp;&nbsp; ${marca("No autorizo")} No autorizo</p>
            <div class="cs-doc-firmas">
                ${bloqueFirma(rotuloFirmante, d.firmante, d.firmanteDoc, firmas.firmante)}
                ${bloqueFirma("del profesional", d.profesional, "", firmas.profesional)}
                ${mostrarTestigo ? bloqueFirma("del testigo (opcional)", "", "", "") : ""}
            </div>
            ${opciones.pie ? `<p class="cs-doc-pie">${esc(opciones.pie)}</p>` : ""}
        </article>`;
    }

    function actualizarVistaPrevia() {
        if (!tipoConsentimiento) return;
        document.getElementById("cs-vista-previa").innerHTML = htmlDocumento(leerDatos());
    }

    // ---------- Impresión ----------
        // ---------- Ventana modal ----------
    const modalFondo = document.createElement("div");
    modalFondo.className = "cs-modal-fondo";
    modalFondo.hidden = true;
    modalFondo.innerHTML = `
        <div class="cs-modal" role="dialog" aria-modal="true" aria-labelledby="cs-modal-titulo">
            <div class="cs-modal-cabecera">
                <h3 id="cs-modal-titulo"></h3>
                <button type="button" class="cs-modal-x" aria-label="Cerrar">&times;</button>
            </div>
            <div class="cs-modal-cuerpo"></div>
            <div class="cs-modal-pie"></div>
        </div>`;
    document.body.appendChild(modalFondo);

    function cerrarModal() {
        modalFondo.hidden = true;
        modalFondo.querySelector(".cs-modal-cuerpo").innerHTML = "";
    }

    function abrirModal({ titulo, html = "", ancho = false, acciones = [] }) {
        modalFondo.querySelector(".cs-modal").classList.toggle("cs-modal-ancho", ancho);
        modalFondo.querySelector("#cs-modal-titulo").textContent = titulo;
        modalFondo.querySelector(".cs-modal-cuerpo").innerHTML = html;
        const pie = modalFondo.querySelector(".cs-modal-pie");
        pie.innerHTML = "";
        acciones.forEach(a => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = `hc-btn ${a.clase || "secondary"}`;
            b.textContent = a.texto;
            b.addEventListener("click", () => {
                if (a.cerrar !== false) cerrarModal();
                if (a.onClick) a.onClick();
            });
            pie.appendChild(b);
        });
        modalFondo.hidden = false;
        pie.querySelector("button:last-child")?.focus();
    }

    modalFondo.addEventListener("click", e => { if (e.target === modalFondo) cerrarModal(); });
    modalFondo.querySelector(".cs-modal-x").addEventListener("click", cerrarModal);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !modalFondo.hidden) cerrarModal(); });

    // ---------- Impresión (en un iframe oculto, no depende del resto de la página) ----------
    const ESTILO_DOCUMENTO = `
        @page { margin: 16mm; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #fff; }
        .cs-doc{font-family:Georgia,"Times New Roman",serif;color:#1c2b2d;line-height:1.55;font-size:12.5pt}
        .cs-doc-cabecera{display:flex;align-items:center;gap:16px;border-bottom:2px solid #3d7b7e;padding-bottom:12px;margin-bottom:14px}
        .cs-doc-logo{height:52px;width:auto}
        .cs-doc-clinica{font-size:13px;color:#587074}
        .cs-doc-cabecera h1{text-align:left;font-size:20px;margin:2px 0 0;color:#1c2b2d}
        .cs-doc-datos{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 24px;margin-bottom:14px}
        .cs-doc-datos span{display:inline-block;min-width:88px;color:#587074}
        .cs-doc-intro{margin:0 0 8px}
        .cs-doc-lista{padding-left:22px;margin:0 0 12px}
        .cs-doc-lista li{margin-bottom:8px;text-align:justify}
        .cs-doc-decision{margin:12px 0 4px}
        .cs-blanco{display:inline-block;min-width:130px;border-bottom:1px solid #1c2b2d;height:1em;vertical-align:baseline}
        .cs-doc-firmas{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:26px;margin-top:22px;break-inside:avoid;page-break-inside:avoid}
        .cs-doc-firma{position:relative;break-inside:avoid}
        .cs-doc-firma-area{height:74px;display:flex;align-items:flex-end;justify-content:center}
        .cs-doc-firma-area img{max-height:70px;max-width:100%}
        .cs-doc-firma-linea{border-top:1px solid #1c2b2d;padding-top:4px;font-size:12.5px;color:#587074}
        .cs-doc-firma-dato{font-size:12.5px;margin-top:5px}
        .cs-doc-pie{margin-top:16px;font-size:12px;color:#587074}
    `;

    function imprimirHTMLDocumento(html, titulo = "Documento Smile Cloud") {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("aria-hidden", "true");
        iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
        document.body.appendChild(iframe);
        const ventana = iframe.contentWindow;
        const doc = ventana.document;
        doc.open();
        doc.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escPrint(titulo)}</title><style>${ESTILO_HISTORIA_IMPRESION}</style></head><body>${html}</body></html>`);
        doc.close();
        const quitar = () => setTimeout(() => iframe.remove(), 500);
        setTimeout(() => { ventana.onafterprint = quitar; ventana.focus(); ventana.print(); }, 150);
    }

    const ESTILO_HISTORIA_IMPRESION = `
        @page { size: A4; margin: 13mm; }
        * { box-sizing: border-box; }
        body { margin:0; background:#fff; color:#20282b; font-family:Arial,Helvetica,sans-serif; font-size:10.5pt; }
        .hc-print-doc { width:100%; }
        .hc-print-header { display:flex; justify-content:space-between; gap:20px; border-bottom:2px solid #1f5558; padding-bottom:10px; margin-bottom:13px; }
        .hc-print-clinic { font-size:11pt; font-weight:800; letter-spacing:1.5px; color:#1f5558; }
        .hc-print-header h1 { margin:3px 0; font-size:18pt; letter-spacing:.2px; }
        .hc-print-header p { margin:0; color:#647276; }
        .hc-print-code { font-size:8.5pt; color:#647276; text-align:right; padding-top:4px; }
        .hc-print-section { margin:0 0 13px; break-inside:auto; }
        .hc-print-section h2 { margin:0 0 7px; padding:5px 8px; background:#edf4f4; border-left:4px solid #3d7b7e; font-size:11.5pt; color:#214e51; }
        .hc-print-grid { display:grid; grid-template-columns:repeat(2,1fr); border-top:1px solid #ccd7d8; border-left:1px solid #ccd7d8; }
        .hc-print-field { min-height:28px; display:flex; gap:7px; align-items:flex-start; padding:5px 7px; border-right:1px solid #ccd7d8; border-bottom:1px solid #ccd7d8; }
        .hc-print-field span, .hc-print-text > span, .hc-print-text-grid span { color:#607074; font-size:8.5pt; min-width:115px; }
        .hc-print-field strong { font-weight:600; }
        .hc-print-text { border:1px solid #ccd7d8; padding:7px; margin-top:7px; }
        .hc-print-text p, .hc-print-text-grid p { margin:4px 0 0; white-space:pre-wrap; line-height:1.45; }
        .hc-print-text-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
        .hc-print-text-grid > div { border:1px solid #ccd7d8; padding:7px; min-height:55px; }
        .hc-print-evolution { border-left:3px solid #3d7b7e; padding:4px 8px; margin:0 0 7px; }
        .hc-print-evolution p { margin:3px 0 0; white-space:pre-wrap; }
        .hc-print-empty { color:#687679; margin:7px 0; }
        .hc-print-footer { display:grid; grid-template-columns:1fr 1fr; gap:35px; margin-top:20px; padding-top:10px; border-top:1px solid #ccd7d8; break-inside:avoid; }
        .hc-print-signature { text-align:center; padding-top:15px; }
        .hc-print-signature div { border-top:1px solid #222; margin:20px auto 4px; width:75%; }
        .hc-print-signature span { display:block; font-size:8.5pt; color:#607074; }
        .hc-print-signature strong { display:block; margin-top:3px; }
        @media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
    `;

    function imprimirHTML(html) {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("aria-hidden", "true");
        iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
        document.body.appendChild(iframe);

        const ventana = iframe.contentWindow;
        const doc = ventana.document;
        doc.open();
        doc.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Consentimiento informado</title><style>${ESTILO_DOCUMENTO}</style></head><body>${html}</body></html>`);
        doc.close();

        const quitar = () => setTimeout(() => iframe.remove(), 500);
        const lanzar = () => {
            ventana.onafterprint = quitar;
            ventana.focus();
            ventana.print();
        };

        // Espera a que carguen las imágenes (logo y firmas) antes de imprimir
        const imagenes = Array.from(doc.images);
        const pendientes = imagenes.filter(i => !i.complete);
        if (!pendientes.length) { lanzar(); return; }
        let listo = false;
        const seguir = () => { if (!listo) { listo = true; lanzar(); } };
        let faltan = pendientes.length;
        pendientes.forEach(i => {
            i.addEventListener("load", () => { if (--faltan === 0) seguir(); });
            i.addEventListener("error", () => { if (--faltan === 0) seguir(); });
        });
        setTimeout(seguir, 2000);
    }

    // ---------- Almacenamiento (igual que la historia: en este equipo) ----------
    const claveConsentimientos = () => pacienteActual ? `smilecloud_consentimientos_${pacienteActual.id_paciente ?? pacienteActual.id}` : null;

    function leerRegistros() {
        const key = claveConsentimientos();
        if (!key) return [];
        try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
    }

    function guardarRegistro(registro) {
        const key = claveConsentimientos();
        const lista = leerRegistros();
        lista.unshift(registro);
        try {
            localStorage.setItem(key, JSON.stringify(lista));
            return true;
        } catch {
            return false;
        }
    }

    function mostrarMensaje(texto, ok = true) {
        const el = document.getElementById("cs-mensaje");
        el.textContent = texto;
        el.className = ok ? "hc-success" : "hc-error";
    }

        function pintarHistorial() {
        const cont = document.getElementById("cs-historial");
        const lista = leerRegistros();
        if (!pacienteActual || !lista.length) {
            cont.innerHTML = `<p class="hc-empty">Aún no hay consentimientos registrados.</p>`;
            return;
        }
        cont.innerHTML = "";
        lista.forEach(r => {
            const cfg = CONSENTIMIENTOS[r.datos.tipo];
            const cuando = new Date(r.fechaHora).toLocaleString("es-CO");
            const pie = r.modo === "digital"
                ? `Firmado digitalmente el ${cuando}.`
                : `Registrado como firmado en físico el ${cuando}.`;

            const item = document.createElement("article");
            item.className = "cs-registro";
            item.innerHTML = `
                <div class="cs-registro-info">
                    <strong>${cfg.icono} ${esc(cfg.titulo)}</strong>
                    <span>${esc(cuando)} · ${r.modo === "digital" ? "Firma digital" : "Firmado en físico"} · ${esc(r.datos.decision || "Según documento físico")}</span>
                </div>
                <div class="cs-registro-botones">
                    <button type="button" class="hc-btn secondary small" data-accion="ver">Ver</button>
                    <button type="button" class="hc-btn outline small" data-accion="imprimir">Imprimir</button>
                </div>`;

            item.querySelector('[data-accion="ver"]').addEventListener("click", () => {
                const documento = htmlDocumento(r.datos, r.firmas, { pie });
                abrirModal({
                    titulo: cfg.titulo,
                    html: documento,
                    ancho: true,
                    acciones: [
                        { texto: "Cerrar", clase: "secondary" },
                        { texto: "Imprimir", clase: "primary", cerrar: false, onClick: () => imprimirHTML(documento) }
                    ]
                });
            });

            item.querySelector('[data-accion="imprimir"]').addEventListener("click", () => {
                imprimirHTML(htmlDocumento(r.datos, r.firmas, { pie }));
            });

            cont.appendChild(item);
        });
    }

    // ---------- Interfaz ----------
    function dibujarCampos(cfg) {
        const cont = document.getElementById("cs-extras");
        cont.innerHTML = "";
        cfg.campos.forEach(c => {
            const bloque = document.createElement("div");
            if (c.ancho === "completo" || c.tipo === "checks") bloque.className = "hc-full";
            const etiqueta = document.createElement("label");
            etiqueta.textContent = c.etiqueta;
            bloque.appendChild(etiqueta);

            if (c.tipo === "select") {
                const sel = document.createElement("select");
                sel.id = `cs-x-${c.id}`;
                c.opciones.forEach(o => sel.add(new Option(o, o)));
                etiqueta.htmlFor = sel.id;
                bloque.appendChild(sel);
            } else if (c.tipo === "checks") {
                const grupo = document.createElement("div");
                grupo.id = `cs-x-${c.id}`;
                grupo.className = "cs-checks";
                c.opciones.forEach(o => {
                    const l = document.createElement("label");
                    l.className = "cs-check";
                    l.innerHTML = `<input type="checkbox" value="${esc(o)}"><span>${esc(o)}</span>`;
                    grupo.appendChild(l);
                });
                bloque.appendChild(grupo);
            } else {
                const inp = document.createElement("input");
                inp.type = c.tipo === "date" ? "date" : "text";
                inp.id = `cs-x-${c.id}`;
                etiqueta.htmlFor = inp.id;
                bloque.appendChild(inp);
            }
            cont.appendChild(bloque);
        });
    }

    function aplicarFirmante() {
        const otro = firmaOtraPersona();
        const check = document.getElementById("cs-otro-firmante");
        const forzado = !!CONSENTIMIENTOS[tipoConsentimiento]?.forzarRepresentante;
        if (forzado) check.checked = true;
        check.disabled = forzado;
        document.getElementById("cs-firmante-datos").hidden = !otro;
        document.getElementById("cs-firma-firmante-label").textContent = otro ? "Firma del representante legal" : "Firma del paciente";
    }

    function limpiarFormulario() {
        padFirmante.limpiar();
        padProfesional.limpiar();
        document.getElementById("cs-acepta").checked = false;
        document.querySelectorAll('input[name="cs-decision"]').forEach(r => { r.checked = false; });
        document.getElementById("cs-otro-firmante").checked = false;
        ["cs-firmante-nombre", "cs-firmante-doc", "cs-firmante-parentesco"].forEach(id => { document.getElementById(id).value = ""; });
    }

    function elegirTipo(tipo) {
        if (!pacienteActual) {
            mostrarMensaje("", true);
            document.getElementById("cs-aviso").hidden = false;
            abrirModal({ titulo: "Falta el paciente", html: "<p>Primero busca y selecciona un paciente en la pestaña Historial.</p>", acciones: [{ texto: "Entendido", clase: "primary" }] });
            return;
        }
        tipoConsentimiento = tipo;
        const cfg = CONSENTIMIENTOS[tipo];
        if (selectorConsentimiento) selectorConsentimiento.value = tipo;
        limpiarFormulario();
        dibujarCampos(cfg);

        document.getElementById("cs-titulo").textContent = cfg.titulo;
        document.getElementById("cs-paciente-nombre").value = `${pacienteActual.nombre ?? ""} ${pacienteActual.apellido ?? ""}`.trim();
        document.getElementById("cs-paciente-documento").value = pacienteActual.numero_documento || "";
        document.getElementById("cs-profesional").value = pacienteActual.especialista || "";
        document.getElementById("cs-fecha").value = new Date().toISOString().slice(0, 10);
        mostrarMensaje("");

        aplicarFirmante();
        document.getElementById("cs-formulario").hidden = false;
        actualizarVistaPrevia();
        document.getElementById("cs-formulario").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cambiarModo(modo) {
        modoFirma = modo;
        document.querySelectorAll(".cs-modo").forEach(b => b.classList.toggle("active", b.dataset.modo === modo));
        document.getElementById("cs-pane-digital").hidden = modo !== "digital";
        document.getElementById("cs-pane-presencial").hidden = modo !== "presencial";
    }

    // Lista desplegable de consentimientos. Al seleccionar uno se abre
    // inmediatamente el formulario para diligenciarlo en línea.
    const selectorConsentimiento = document.getElementById("cs-selector");
    Object.entries(CONSENTIMIENTOS).forEach(([tipo, cfg]) => {
        const option = new Option(`${cfg.icono} ${cfg.titulo}`, tipo);
        option.title = cfg.resumen;
        selectorConsentimiento.appendChild(option);
    });
    selectorConsentimiento.addEventListener("change", () => {
        if (selectorConsentimiento.value) elegirTipo(selectorConsentimiento.value);
    });

    document.querySelectorAll(".cs-modo").forEach(b => b.addEventListener("click", () => cambiarModo(b.dataset.modo)));

    const formularioCs = document.getElementById("cs-formulario");
    formularioCs.addEventListener("input", actualizarVistaPrevia);
    formularioCs.addEventListener("change", () => { aplicarFirmante(); actualizarVistaPrevia(); });

    // Guardar firma digital
    document.getElementById("cs-guardar-digital").addEventListener("click", () => {
        const d = leerDatos();
        if (!d.decision) return mostrarMensaje("Seleccione la decisión del paciente: Autorizo o No autorizo.", false);
        if (!d.firmante) return mostrarMensaje("Escriba el nombre de quien firma.", false);
        if (!document.getElementById("cs-acepta").checked) return mostrarMensaje("Marque que el firmante leyó y comprendió el consentimiento.", false);
        if (padFirmante.estaVacio()) return mostrarMensaje("Falta la firma en pantalla.", false);

        const registro = {
            fechaHora: new Date().toISOString(),
            modo: "digital",
            datos: d,
            firmas: {
                firmante: padFirmante.imagen(),
                profesional: padProfesional.estaVacio() ? "" : padProfesional.imagen()
            }
        };
        if (!guardarRegistro(registro)) {
            return mostrarMensaje("No se pudo guardar: el almacenamiento del navegador está lleno.", false);
        }
        padFirmante.limpiar();
        padProfesional.limpiar();
        document.getElementById("cs-acepta").checked = false;
        mostrarMensaje("Consentimiento firmado y guardado correctamente en este equipo.");
        pintarHistorial();
    });

    // Firma presencial
        // Firma presencial
    document.getElementById("cs-imprimir").addEventListener("click", () => {
        if (!tipoConsentimiento) return;
        imprimirHTML(htmlDocumento(leerDatos()));
    });

    document.getElementById("cs-registrar-fisico").addEventListener("click", () => {
        if (!tipoConsentimiento) return;
        const d = leerDatos();
        abrirModal({
            titulo: "Confirmar firma presencial",
            html: `<p>¿Confirma que el formato impreso ya fue firmado por el paciente?</p>
                   <p class="hc-muted">${esc(CONSENTIMIENTOS[tipoConsentimiento].titulo)}<br>Paciente: ${esc(d.paciente)}</p>`,
            acciones: [
                { texto: "Cancelar", clase: "secondary" },
                {
                    texto: "Sí, registrar",
                    clase: "primary",
                    onClick: () => {
                        const registro = { fechaHora: new Date().toISOString(), modo: "presencial", datos: d, firmas: {} };
                        if (!guardarRegistro(registro)) {
                            return mostrarMensaje("No se pudo guardar: el almacenamiento del navegador está lleno.", false);
                        }
                        mostrarMensaje("Consentimiento registrado como firmado en físico.");
                        pintarHistorial();
                    }
                }
            ]
        });
    });

    // Se llama cada vez que se carga un paciente
    function refrescarConsentimientos() {
        document.getElementById("cs-aviso").hidden = !!pacienteActual;
        formularioCs.hidden = true;
        tipoConsentimiento = null;
        const selector = document.getElementById("cs-selector");
        if (selector) selector.value = "";
        pintarHistorial();
    }
    refrescarConsentimientos();
    cambiarModo("digital");


});

// ======================================================
// REGISTRO POR VOZ
// ======================================================

const btnVoz = document.getElementById("btn-voz");
const estadoVoz = document.getElementById("estado-voz");

let reconocimientoVoz = null;

if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    reconocimientoVoz = new SpeechRecognition();

    reconocimientoVoz.lang = "es-CO";

    reconocimientoVoz.continuous = true;

    reconocimientoVoz.interimResults = true;


    reconocimientoVoz.onstart = () => {

        estadoVoz.textContent =
            "🎙️ Escuchando... Hable normalmente.";

        estadoVoz.className =
            "hc-success";

        btnVoz.textContent =
            "⏹️ Detener registro";

    };


    reconocimientoVoz.onresult = event => {

        let textoFinal = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const resultado =
                event.results[i];

            if (resultado.isFinal) {

                textoFinal +=
                    resultado[0].transcript + " ";

            }

        }


        if (textoFinal.trim()) {

            agregarTextoVoz(
                textoFinal.trim()
            );

        }

    };


    reconocimientoVoz.onerror = event => {

        console.error(
            "Error de reconocimiento:",
            event.error
        );

        estadoVoz.textContent =
            "❌ No se pudo utilizar el micrófono.";

        estadoVoz.className =
            "hc-error";

        btnVoz.textContent =
            "🎙️ Registrar por voz";

    };


    reconocimientoVoz.onend = () => {

        estadoVoz.textContent =
            "Registro por voz finalizado.";

        btnVoz.textContent =
            "🎙️ Registrar por voz";

    };


    btnVoz.addEventListener(
        "click",
        () => {

            if (
                btnVoz.textContent.includes("Detener")
            ) {

                reconocimientoVoz.stop();

            } else {

                reconocimientoVoz.start();

            }

        }
    );


} else {

    btnVoz.disabled = true;

    estadoVoz.textContent =
        "El navegador no admite reconocimiento de voz.";

}


// ======================================================
// COLOCAR TEXTO RECONOCIDO
// ======================================================

function agregarTextoVoz(texto) {

    const observaciones =
        document.getElementById(
            "observaciones-clinicas"
        );

    if (!observaciones) return;


    if (observaciones.value.trim()) {

        observaciones.value +=
            " " + texto;

    } else {

        observaciones.value =
            texto;

    }

}