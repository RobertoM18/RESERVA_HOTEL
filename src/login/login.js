document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById('registroForm');
  const btnRegistro = document.getElementById("btn-registro");

  // Manejador del formulario de login
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Limpiar errores previos
      document.getElementById('usernameError').textContent = "";
      document.getElementById('passwordError').textContent = "";

      // Recoger valores
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      let valid = true;

      // Validaciones simples
      if (!username) {
        document.getElementById('usernameError').textContent = "Nombre de usuario obligatorio";   
        valid = false;
      }
      if (!password) {
        document.getElementById('passwordError').textContent = "Contraseña obligatoria";
        valid = false;
      }
      if (!valid) return;

      try {
        const res = await fetch("http://localhost:3000/api/users/login", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newUsername: username,
            newPassword: password
          })
        });
        const data = await res.json();

        if (!res.ok) {
          // Mostrar mensaje de error desde el servidor
          const msg = data.error || data.message || "Credenciales inválidas";
          document.getElementById('passwordError').textContent = msg;
          return;
        }
        // Guardar el usuario en localStorage
        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          guest_id: data.user.guest_id, // ✅ asegúrate que viene del backend
          rol_id: data.user.rol_id
        }));

        // Redirigir a room.html
        window.location.href = "../room/room.html";
      } catch (err) {
        console.error("Error en login:", err);
        document.getElementById('passwordError').textContent = "Error de conexión, inténtalo de nuevo";
      }
    });
  }

  // Botón para ir a signup
  if (btnRegistro) {
    btnRegistro.addEventListener("click", function () {
      window.location.href = "../signup/signup.html";
    });
  }
});
