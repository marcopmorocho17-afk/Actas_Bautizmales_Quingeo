// Datos de tu proyecto de Supabase
const supabaseUrl = "https://gwzksvqidqfwwrehyonc.supabase.co";
const supabaseKey = "sb_publishable_Pprp0PSkxKfc7ieELFxOgQ_zR4rkDVf";

// Crear conexión
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Guardar una acta
async function guardarActa() {

    const datos = {
        nombres: document.getElementById("nombres").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
        lugar_nacimiento: document.getElementById("lugar_nacimiento").value.trim(),
        fecha_bautismo: document.getElementById("fecha_bautismo").value,
        parroquia: document.getElementById("parroquia").value.trim(),
        padre: document.getElementById("padre").value.trim(),
        madre: document.getElementById("madre").value.trim(),
        padrino: document.getElementById("padrino").value.trim(),
        madrina: document.getElementById("madrina").value.trim(),
        sacerdote: document.getElementById("sacerdote").value.trim(),
        tomo: Number(document.getElementById("tomo").value),
        pagina: Number(document.getElementById("pagina").value),
        numero_acta: Number(document.getElementById("numero_acta").value)
    };

    const { error } = await supabase
        .from("actas_bautismales")
        .insert([datos]);

    if (error) {
        console.error(error);
        alert("Error al guardar: " + error.message);
        return;
    }

    alert("Acta guardada correctamente.");

    document.getElementById("nombres").value = "";
    document.getElementById("apellidos").value = "";
    document.getElementById("fecha_nacimiento").value = "";
    document.getElementById("lugar_nacimiento").value = "";
    document.getElementById("fecha_bautismo").value = "";
    document.getElementById("parroquia").value = "";
    document.getElementById("padre").value = "";
    document.getElementById("madre").value = "";
    document.getElementById("padrino").value = "";
    document.getElementById("madrina").value = "";
    document.getElementById("sacerdote").value = "";
    document.getElementById("tomo").value = "";
    document.getElementById("pagina").value = "";
    document.getElementById("numero_acta").value = "";
}