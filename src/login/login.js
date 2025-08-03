document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById('registroForm');
  const btnRegistro = document.getElementById("btn-registro");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Obtener valores
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const usernameError = document.getElementById('usernameError');
      const passwordError = document.getElementById('passwordError');

      // Limpiar errores
      usernameError.textContent = "";
      passwordError.textContent = "";

      // Validaciones
      if (!username || !password) {
        if (!username) usernameError.textContent = "Nombre de usuario obligatorio";
        if (!password) passwordError.textContent = "Contraseña obligatoria";
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }) // ✅ corregido aquí
        });

        const data = await res.json();

        if (!res.ok) {
          passwordError.textContent = data.error || "Credenciales inválidas";
          return;
        }

        // Guardar usuario y redirigir
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "../room/room.html";
      } catch (err) {
        console.error("Error en login:", err);
        passwordError.textContent = "Error de conexión. Intenta más tarde.";
      }
    });
  }

  // Navegar a registro
  btnRegistro?.addEventListener("click", () => {
    window.location.href = "../signup/signup.html";
  });
});
