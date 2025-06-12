document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    document
      .querySelectorAll(".error-txt")
      .forEach((span) => (span.textContent = ""));

    const newUsername = form.newUsername.value.trim();
    const newPassword = form.newPassword.value;
    const confPassword = form.confPassword.value;
    const phone = form.phone.value.trim();
    const email = form.email.value.trim().toLowerCase();

    const errorContainer = document.querySelectorAll(".error");

    let valid = true;

    if (!newUsername) {
      document.getElementById("newUsernameError").textContent =
        "Ingrese su nombre de Usuario";
      valid = false;
    }

    if (!newPassword || newPassword.length < 6) {
      document.getElementById("newPasswordError").textContent =
        "Minimo 6 caracteres";
      valid = false;
    }

    if (newPassword !== confPassword) {
      document.getElementById("confPasswordError").textContent =
        "Las contraseñas no coinciden";
      valid = false;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      document.getElementById("emailError").textContent = "Correo Invalido";
      valid = false;
    }

    if (!phone || !/^\d{0,10}$/.test(phone)) {
      document.getElementById("phoneError").textContent = "Telefono Invalido";
      valid = false;
    }

    if (!valid) return;

    document.querySelector(".error-txt").textContent = "¡Registro exitoso!";
    document.querySelector(".error-txt").style.color = "green";
    form.reset();

    const userData = {
      newUsername: newUsername,
      newPassword: newPassword,
      phone: phone,
      email: email,
    };

    try {
        const response = await fetch("http://localhost:3000/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log(data); 

    document.querySelector(".error-txt").textContent = "¡Registro exitoso!";
    document.querySelector(".error-txt").style.color = "green";
    form.reset();
    } catch (error) {
        document.querySelector(".error-txt").textContent = "Error de Registro"
        form.reset();
    }
  });
});
