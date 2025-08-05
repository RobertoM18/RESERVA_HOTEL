document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Debes iniciar sesión");
    window.location.href = "../login/login.html";
    return;
  }

  const form = document.getElementById("form-actualizar-password");
  const mensaje = document.getElementById("mensaje-password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensaje.textContent = "";

    const actual = document.getElementById("password-actual").value.trim();
    const nueva = document.getElementById("nueva-password").value.trim();
    const confirmar = document.getElementById("confirmar-password").value.trim();

    if (!actual || !nueva || !confirmar) {
      mensaje.textContent = "Todos los campos son obligatorios.";
      return;
    }

    if (nueva !== confirmar) {
      mensaje.textContent = "Las contraseñas no coinciden.";
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/users/cambiar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: user.id,
            passwordActual: actual,
            nuevaPassword: nueva
        })
        });


      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en el servidor");

      mensaje.textContent = "✅ Contraseña actualizada correctamente.";
      form.reset();
    } catch (err) {
      mensaje.textContent = "❌ " + err.message;
    }
  });
});
