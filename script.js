function ver() {

    let usuario = document.getElementById("Usuiario").value;
    let contrasena = document.getElementById("Contrasena").value;

    if (usuario === "Pedro" && contrasena === "12345") {
        window.location.href = "index2.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }

}