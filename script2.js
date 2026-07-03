const supabase = window.supabase.createClient(
    "https://gwzksvqidqfwwrehyonc.supabase.co",
    "sb_publishable_Pprp0PSkxKfc7ieELFxOgQ_zR4rkDVf"
);

async function buscarActas() {

    const apellido = document.getElementById("Buscador").value;

    const { data, error } = await supabase
        .from("actas_bautismales")
        .select("*")
        .ilike("apellidos", "%" + apellido + "%");

    if (error) {
        console.log(error);
        return;
    }

    const resultados = document.getElementById("resultados");
    resultados.innerHTML = "";

    data.forEach(acta => {

        resultados.innerHTML += `
        <div class="acta">
            <h2>${acta.nombres} ${acta.apellidos}</h2>

            <p><strong>Fecha de nacimiento:</strong> ${acta.fecha_nacimiento}</p>
            <p><strong>Lugar de nacimiento:</strong> ${acta.lugar_nacimiento}</p>

            <p><strong>Fecha de bautismo:</strong> ${acta.fecha_bautismo}</p>
            <p><strong>Parroquia:</strong> ${acta.parroquia}</p>

            <p><strong>Padre:</strong> ${acta.padre}</p>
            <p><strong>Madre:</strong> ${acta.madre}</p>

            <p><strong>Padrino:</strong> ${acta.padrino}</p>
            <p><strong>Madrina:</strong> ${acta.madrina}</p>

            <p><strong>Sacerdote:</strong> ${acta.sacerdote}</p>

            <p><strong>Tomo:</strong> ${acta.tomo}</p>
            <p><strong>Página:</strong> ${acta.pagina}</p>
            <p><strong>Número de Acta:</strong> ${acta.numero_acta}</p>
        </div>
        `;

    });

}

function Mostrar() {
    window.location.href = "index3.html";
}