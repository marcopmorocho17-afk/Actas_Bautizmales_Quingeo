// Datos de tu proyecto de Supabase
const supabaseUrl = "https://gwzksvqidqfwwrehyonc.supabase.co";
const supabaseKey = "sb_publishable_Pprp0PSkxKfc7ieELFxOgQ_zR4rkDVf";

// Crear conexión
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

function getValue(id) {
    return document.getElementById(id)?.value ?? "";
}

// Guardar una acta
async function guardarActa() {
    if (!supabase) {
        console.error("Supabase no está inicializado.");
        alert("Error: No se pudo conectar con Supabase.");
        return;
    }

    const datos = {
        nombres: getValue("nombres").trim(),
        apellidos: getValue("apellidos").trim(),
        fecha_nacimiento: getValue("fecha_nacimiento"),
        lugar_nacimiento: getValue("lugar_nacimiento").trim(),
        fecha_bautismo: getValue("fecha_bautismo"),
        parroquia: getValue("parroquia").trim(),
        padre: getValue("padre").trim(),
        madre: getValue("madre").trim(),
        padrino: getValue("padrino").trim(),
        madrina: getValue("madrina").trim(),
        sacerdote: getValue("sacerdote").trim(),
        tomo: getValue("tomo").trim(),
        pagina: getValue("pagina").trim(),
        numero_acta: getValue("numero_acta").trim()
    };

    const { error } = await supabase
        .from("actos_bautismales")
        .insert([datos]);

    if (error) {
        console.error(error);
        alert("Error al guardar: " + error.message);
        return;
    }

    alert("Acta guardada correctamente.");

    const campos = [
        "nombres",
        "apellidos",
        "fecha_nacimiento",
        "lugar_nacimiento",
        "fecha_bautismo",
        "parroquia",
        "padre",
        "madre",
        "padrino",
        "madrina",
        "sacerdote",
        "tomo",
        "pagina",
        "numero_acta"
    ];

    campos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = "";
    });
}