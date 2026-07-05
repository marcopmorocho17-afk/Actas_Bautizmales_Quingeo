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
            .order("primer_apellido", { ascending: true })
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
    const resultados = document.getElementById("resultados");
    resultados.innerHTML = "";

    data.forEach((acta, index) => {
        // Combinamos nombres y apellidos dinámicamente para mostrarlos de forma limpia
        const nombreCompleto = `${acta.primer_nombre} ${acta.segundo_nombre || ''} ${acta.primer_apellido} ${acta.segundo_apellido || ''}`.trim();

        resultados.innerHTML += `
        <div class="acta">
            <h2>${nombreCompleto}</h2>

            <p><strong>Fecha de nacimiento:</strong> ${acta.fecha_nacimiento || acta.ano_nacimiento}</p>
            <p><strong>Año de bautismo:</strong> ${acta.ano_bautismo}</p>
            <p><strong>Lugar de bautismo:</strong> ${acta.lugar_bautismo}</p>

            <p><strong>Padre:</strong> ${acta.padre}</p>
            <p><strong>Madre:</strong> ${acta.madre || 'No registrada'}</p>

            <p><strong>Padrino:</strong> ${acta.padrino || 'No registrado'}</p>
            <p><strong>Madrina:</strong> ${acta.madrina || 'No registrada'}</p>

            <p><strong>Presbitero:</strong> ${acta.sacerdote}</p>

            <p><strong>Ubicación del Documento:</strong> Libro ${acta.libro_acta}, Página ${acta.pagina_acta}, Acta Nº ${acta.numero_acta}</p>
            <button type="button" class="descargar-btn" onclick="descargarActa(${index})">Descargar</button>
        </div>
        `;
    });
}

function Mostrar() {
    window.location.href = "index3.html";
}

function getFieldValue(id) {
    return document.getElementById(id)?.value.trim() ?? "";
}

function getYearFromDateField(id) {
    const value = document.getElementById(id)?.value;
    if (!value) return null;
    const date = new Date(value);
    return Number.isFinite(date.getFullYear()) ? date.getFullYear() : null;
}

async function guardarActa() {
    if (!supabaseClient) {
        console.error("Supabase no está inicializado.");
        alert("Error: Supabase no está disponible.");
        return;
    }

    const camposRequeridos = [
        "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido",
        "fecha_nacimiento", "lugar_nacimiento", "lugar_bautismo", "fecha_bautismo",
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
        ano_nacimiento: getYearFromDateField("fecha_nacimiento"),
        lugar_nacimiento: getFieldValue("lugar_nacimiento"),
        ano_bautismo: getYearFromDateField("fecha_bautismo"),
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

document.addEventListener("DOMContentLoaded", prefillActaForm);
