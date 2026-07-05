const supabaseClient = window.supabase ? window.supabase.createClient(
    "https://pqujkymsnigzqwmzgayu.supabase.co",
    "sb_publishable_ENDgHXkmxWZB1v2yMj1TOg_aBDG5oE1"
) : null;

let currentActas = [];

// Buscamos la tabla correcta en Supabase
const tableCandidates = ["actas_bautismo", "actos_bautismales", "tas_Bautismales"];
let resolvedTableName = null;

async function resolveTableName() {
    if (resolvedTableName) return resolvedTableName;
    if (!supabaseClient) return null;

    for (const tableName of tableCandidates) {
        const { error } = await supabaseClient.from(tableName).select("*").limit(1);
        if (!error) {
            resolvedTableName = tableName;
            return tableName;
        }

        const notFound = error?.code === "PGRST204" || error?.code === "PGRST206" || error?.status === 404 ||
            (error?.message && error.message.includes("Could not find"));
        if (notFound) {
            continue;
        }

        console.warn(`Error verificando tabla ${tableName}:`, error);
    }

    console.error("No se encontró ninguna tabla Supabase válida. Revisa los nombres de tus tablas.");
    return null;
}

function ver() {
    let usuario = document.getElementById("Usuario").value;
    let contrasena = document.getElementById("Contrasena").value;

    if (usuario === "BAUTIZOS" && contrasena === "ROSA") {
        window.location.href = "index2.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

async function buscarActas() {
    if (!supabaseClient) {
        console.error("Supabase no está inicializado.");
        return;
    }

    const terminoBusqueda = document.getElementById("Buscador").value.trim();
    const tableName = await resolveTableName();

    if (!tableName) {
        alert("Error: no se encontró ninguna tabla válida en Supabase.");
        return;
    }

    let data;
    let error;

    if (!terminoBusqueda) {
        ({ data, error } = await supabaseClient
            .from(tableName)
            .select("*")
            .order("primer_nombre", { ascending: true })
            .limit(200));
    } else {
        const filtro = [
            `primer_nombre.ilike.%${terminoBusqueda}%`,
            `segundo_nombre.ilike.%${terminoBusqueda}%`,
            `primer_apellido.ilike.%${terminoBusqueda}%`,
            `segundo_apellido.ilike.%${terminoBusqueda}%`,
            `lugar_nacimiento.ilike.%${terminoBusqueda}%`,
            `lugar_bautismo.ilike.%${terminoBusqueda}%`,
            `padre.ilike.%${terminoBusqueda}%`,
            `madre.ilike.%${terminoBusqueda}%`,
            `padrino.ilike.%${terminoBusqueda}%`,
            `madrina.ilike.%${terminoBusqueda}%`,
            `sacerdote.ilike.%${terminoBusqueda}%`,
            `libro_acta.ilike.%${terminoBusqueda}%`,
            `pagina_acta.ilike.%${terminoBusqueda}%`,
            `numero_acta.ilike.%${terminoBusqueda}%`
        ].join(",");

        ({ data, error } = await supabaseClient
            .from(tableName)
            .select("*")
            .or(filtro)
            .limit(200));
    }

    if (error) {
        console.error(error);
        alert("Error al buscar actas. Revisa la consola para más detalles.");
        return;
    }

    currentActas = data;
    renderActas();
}

function renderActas() {
    const resultados = document.getElementById("resultados");
    resultados.innerHTML = "";

    if (!currentActas || currentActas.length === 0) {
        resultados.innerHTML = '<p>No hay actas para mostrar.</p>';
        return;
    }

    // Asegurar orden alfabético por primer_nombre en el cliente también
    currentActas.sort((a, b) => (a.primer_nombre || '').localeCompare(b.primer_nombre || '', 'es', { sensitivity: 'base' }));

    const table = document.createElement('table');
    table.className = 'tabla-actas';
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nombre</th>
            <th>F. Nacimiento</th>
            <th>F. Bautismo</th>
            <th>Lugar Bautismo</th>
            <th>Padre</th>
            <th>Madre</th>
            <th>Padrino</th>
            <th>Madrina</th>
            <th>Presbitero</th>
            <th>Ubicación</th>
            <th>Acciones</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    currentActas.forEach((acta, index) => {
        const nombreCompleto = `${acta.primer_nombre || ''} ${acta.segundo_nombre || ''} ${acta.primer_apellido || ''} ${acta.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nombreCompleto}</td>
            <td>${acta.fecha_nacimiento || acta.ano_nacimiento || ''}</td>
            <td>${acta.fecha_bautismo || acta.ano_bautismo || ''}</td>
            <td>${acta.lugar_bautismo || ''}</td>
            <td>${acta.padre || ''}</td>
            <td>${acta.madre || ''}</td>
            <td>${acta.padrino || ''}</td>
            <td>${acta.madrina || ''}</td>
            <td>${acta.sacerdote || ''}</td>
            <td>Libro ${acta.libro_acta || ''}, Pág ${acta.pagina_acta || ''}, N° ${acta.numero_acta || ''}</td>
            <td>
                <button type="button" onclick="descargarActa(${index})">Descargar</button>
                <button type="button" onclick="eliminarActa(${index})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    resultados.appendChild(table);
}

function eliminarActa(index) {
    currentActas.splice(index, 1);
    renderActas();
}

function Mostrar() {
    window.location.href = "index3.html";
}

const historialCampos = [
    "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido",
    "lugar_nacimiento", "lugar_bautismo",
    "padre", "madre", "padrino", "madrina", "sacerdote",
    "libro_acta", "pagina_acta", "numero_acta"
];

function getFieldValue(id) {
    return document.getElementById(id)?.value.trim() ?? "";
}

function getYearFromDateField(id) {
    const value = document.getElementById(id)?.value;
    if (!value) return null;
    const date = new Date(value);
    return Number.isFinite(date.getFullYear()) ? date.getFullYear() : null;
}

function getHistorial() {
    const raw = localStorage.getItem("historialActas");
    try {
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.warn("Historial local inválido, se reiniciará.", error);
        return {};
    }
}

function saveHistorial(historial) {
    localStorage.setItem("historialActas", JSON.stringify(historial));
}

function agregarValorHistorial(campo, valor) {
    if (!valor) return;
    const historial = getHistorial();
    const lista = new Set(historial[campo] || []);
    lista.add(valor);
    historial[campo] = Array.from(lista).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
    saveHistorial(historial);
}

function cargarHistorialInputs() {
    const historial = getHistorial();
    historialCampos.forEach(campo => {
        const datalist = document.getElementById(`historial_${campo}`);
        if (!datalist) return;
        datalist.innerHTML = "";
        (historial[campo] || []).forEach(valor => {
            const option = document.createElement("option");
            option.value = valor;
            datalist.appendChild(option);
        });
    });
}

function actualizarHistorialActa(datos) {
    historialCampos.forEach(campo => {
        agregarValorHistorial(campo, datos[campo]);
    });
}

async function guardarActa() {
    if (!supabaseClient) {
        console.error("Supabase no está inicializado.");
        alert("Error: Supabase no está disponible.");
        return;
    }

    const camposRequeridos = [
        "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido",
        "fecha_nacimiento", "lugar_nacimiento", "fecha_bautismo", "lugar_bautismo",
        "sacerdote", "padre", "madre", "padrino", "madrina",
        "libro_acta", "pagina_acta", "numero_acta"
    ];

    for (const id_campo of camposRequeridos) {
        const elemento = document.getElementById(id_campo);
        if (!elemento) {
            console.error(`Error crítico: No se encontró el elemento HTML con id="${id_campo}"`);
            alert(`Error en el formulario: Falta la casilla con id "${id_campo}".`);
            return;
        }

        if (!elemento.value.trim()) {
            alert(`Completa el campo: ${elemento.previousElementSibling?.innerText || id_campo}`);
            elemento.focus();
            return;
        }
    }

    const datos = {
        primer_nombre: getFieldValue("primer_nombre"),
        segundo_nombre: getFieldValue("segundo_nombre"),
        primer_apellido: getFieldValue("primer_apellido"),
        segundo_apellido: getFieldValue("segundo_apellido"),
        fecha_nacimiento: getFieldValue("fecha_nacimiento"),
        lugar_nacimiento: getFieldValue("lugar_nacimiento"),
        fecha_bautismo: getFieldValue("fecha_bautismo"),
        lugar_bautismo: getFieldValue("lugar_bautismo"),
        sacerdote: getFieldValue("sacerdote"),
        padre: getFieldValue("padre"),
        madre: getFieldValue("madre"),
        padrino: getFieldValue("padrino"),
        madrina: getFieldValue("madrina"),
        libro_acta: getFieldValue("libro_acta"),
        pagina_acta: getFieldValue("pagina_acta"),
        numero_acta: getFieldValue("numero_acta")
    };

    const tableName = await resolveTableName();
    const { error } = await supabaseClient
        .from(tableName)
        .insert([datos]);

    if (error) {
        console.error(error);
        alert("Error al guardar: " + error.message);
        return;
    }

    alert("Acta guardada correctamente.");

    actualizarHistorialActa(datos);
    cargarHistorialInputs();

    const formulario = document.querySelector(".formulario");
    if (formulario && typeof formulario.reset === "function") {
        formulario.reset();
    }
}

function descargarActa(index) {
    const acta = currentActas[index];
    if (!acta) {
        alert("Imposible descargar: no se encontró el acta seleccionada.");
        return;
    }

    localStorage.setItem("actaParaImprimir", JSON.stringify(acta));
    window.location.href = "descargar.html";
}

function prefillActaForm() {
    const acta = JSON.parse(localStorage.getItem("actaParaEditar") || "null");
    if (!acta) {
        return;
    }

    const campos = {
        primer_nombre: acta.primer_nombre,
        segundo_nombre: acta.segundo_nombre,
        primer_apellido: acta.primer_apellido,
        segundo_apellido: acta.segundo_apellido,
        fecha_nacimiento: acta.fecha_nacimiento || acta.ano_nacimiento,
        lugar_nacimiento: acta.lugar_nacimiento,
        lugar_bautismo: acta.lugar_bautismo,
        fecha_bautismo: acta.fecha_bautismo,
        padre: acta.padre,
        madre: acta.madre,
        padrino: acta.padrino,
        madrina: acta.madrina,
        sacerdote: acta.sacerdote,
        libro_acta: acta.libro_acta,
        pagina_acta: acta.pagina_acta,
        numero_acta: acta.numero_acta
    };

    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor || "";
        }
    });

    localStorage.removeItem("actaParaEditar");
}

document.addEventListener("DOMContentLoaded", () => {
    cargarHistorialInputs();
    prefillActaForm();
    // Cargar y mostrar todas las actas al entrar en la página de listados
    try { buscarActas(); } catch (e) { console.warn('No se pudo cargar actas al inicio', e); }
});
