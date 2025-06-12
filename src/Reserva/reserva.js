document.addEventListener("DOMContentLoaded", async function () {
  const user = JSON.parse(localStorage.getItem('user'));
  const container = document.getElementById("reservas-container");

  if (!user) {
    alert("Debes iniciar sesión");
    window.location.href = "../login/login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/users/${user.id}/reservas`);
    const reservas = await res.json();

    if (!reservas || reservas.length === 0) {
      container.innerHTML = "<p>No tienes reservas registradas.</p>";
      return;
    }

    container.innerHTML = ""; // Limpiar contenedor

    reservas.forEach(reserva => {
      const card = document.createElement("div");
      card.classList.add("reserva-card");

      const reservaId = reserva.reservation_id;

      if (!reservaId) {
        console.warn("Reserva sin ID:", reserva);
        return;
      }

      // Depuración de imagen
      console.log("URL de imagen:", reserva.imagen);

      card.innerHTML = `
        <img 
          src="${reserva.imagen || 'https://via.placeholder.com/300x200?text=Sin+imagen'}" 
          alt="Habitación"
          onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible';"
        />
        <div class="info">
          <h3>${reserva.room_name}</h3>
          <p><strong>Tipo:</strong> ${reserva.room_type}</p>
          <p><strong>Entrada:</strong> ${reserva.entry_date}</p>
          <p><strong>Salida:</strong> ${reserva.departure_date}</p>
          <p><strong>Estado:</strong> ${reserva.state}</p>
          <button class="cancel-btn" data-id="${reservaId}">Cancelar</button>
        </div>
      `;

      container.appendChild(card);
    });

    // Eventos de cancelación
      document.querySelectorAll(".cancel-btn").forEach(button => {
        button.addEventListener("click", async () => {
          const reservaId = button.getAttribute("data-id");

          if (!reservaId) {
            alert("ID de reserva no válido");
            return;
          }

          if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;

          try {
            const cancelRes = await fetch(`http://localhost:3000/api/users/reservas/${reservaId}/cancelar`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ userId: user.id }) // ✅ Se envía el userId
            });

            if (!cancelRes.ok) {
              const errorText = await cancelRes.text();
              throw new Error(`Error HTTP: ${cancelRes.status} - ${errorText}`);
            }

            await cancelRes.json();

            alert("Reserva cancelada correctamente");
            const card = button.closest(".reserva-card");
            card.remove();

            // Mostrar mensaje si no quedan reservas
            if (document.querySelectorAll(".reserva-card").length === 0) {
              container.innerHTML = "<p>No tienes reservas registradas.</p>";
            }

          } catch (err) {
            console.error("Error al cancelar reserva:", err);
            alert("Error al cancelar reserva: " + err.message);
          }
        });
      });


  } catch (err) {
    console.error("Error al cargar reservas:", err);
    container.innerHTML = "<p>Error al cargar las reservas.</p>";
  }
});
