document.addEventListener("DOMContentLoaded", async function () {
  flatpickr("#date-range", {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: "today",
    locale: { firstDayOfWeek: 1 }
  });

  const dateInput = document.getElementById("date-range");
  const container = document.getElementById('room-container');
  const selectType = document.getElementById('room-type');
  const selectPrice = document.getElementById('price-range');
  const selectCategoria = document.getElementById('categoria');
  const pagination = document.getElementById('pagination-controls');
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const user = JSON.parse(localStorage.getItem("user"));
  let currentPage = 1;
  const roomsPerPage = 8;
  let totalPages = 1;

  const logoutBtn = document.getElementById('logout--btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async function (event) {
    event.preventDefault();

    if (!user || !user.id || !user.username) {
      console.warn("No se encontró el usuario en localStorage.");
    } else {
      try {
        const response = await fetch(`http://localhost:3000/api/users/logout?userId=${user.id}&username=${user.username}`, {
          method: "POST"
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error en logout:", errorText);
        } else {
          console.log("Logout registrado correctamente.");
        }
      } catch (error) {
        console.error("Error al enviar logout:", error);
      }
    }

    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = "../login/login.html";
  });
}

  function renderPagination() {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const createBtn = (text, page, disabled = false, isActive = false) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      if (disabled) btn.disabled = true;
      if (isActive) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = page;
        fetchRoomsFromBackend(page);
      });
      return btn;
    };

    pagination.appendChild(createBtn("« Primero", 1, currentPage === 1));
    pagination.appendChild(createBtn("‹ Anterior", currentPage - 1, currentPage === 1));

    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pagination.appendChild(createBtn(i, i, false, i === currentPage));
    }

    pagination.appendChild(createBtn("Siguiente ›", currentPage + 1, currentPage === totalPages));
    pagination.appendChild(createBtn("Último »", totalPages, currentPage === totalPages));
  }

  function displayRooms(rooms) {
    container.innerHTML = "";

    if (rooms.length === 0) {
      container.innerHTML = "<p>No se encontraron habitaciones.</p>";
      pagination.innerHTML = "";
      return;
    }

    rooms.forEach(room => {
      const card = document.createElement('div');
      card.classList.add('room-card');
      card.innerHTML = `
        <img src="${room.imagen}" alt="Imagen habitación">
        <div class="info">
          <h3>${room.name}</h3>
          <p><strong>Tipo:</strong> ${room.type}</p>
          <p><strong>Precio:</strong> $${room.price}</p>
          <p><strong>Capacidad:</strong> ${room.ability}</p>
          <p><strong>Categoría:</strong> ${room.category}★</p>
          <button class="reserve-myself-btn" data-room-id="${room.id}">Reservar para mí</button>
          <button class="reserve-btn" data-room-id="${room.id}">Reservar para otro huésped</button>
        </div>`;
      container.appendChild(card);
    });

    renderPagination();

    document.querySelectorAll(".reserve-btn").forEach(button => {
      button.addEventListener("click", () => {
        const roomId = button.dataset.roomId;
        const dateRange = dateInput.value;

        if (!dateRange.includes(" to ")) {
          alert("Selecciona un rango de fechas válido.");
          return;
        }

        const [checkIn, checkOut] = dateRange.split(" to ");
        localStorage.setItem("checkInDate", checkIn);
        localStorage.setItem("checkOutDate", checkOut);
        localStorage.setItem("selectedRoomId", roomId);

        document.getElementById("guest-modal").classList.remove("hidden");
      });
    });

    document.querySelectorAll(".reserve-myself-btn").forEach(button => {
      button.addEventListener("click", () => {
        const roomId = button.dataset.roomId;
        localStorage.setItem("selectedRoomId", roomId);
        document.getElementById("self-modal").classList.remove("hidden");
      });
    });
  }

  async function fetchRoomsFromBackend(page = 1) {
    const typeFilter = selectType.value;
    const priceFilter = selectPrice.value;
    const categoriaFilter = selectCategoria.value;
    const searchText = searchInput.value.trim();

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", roomsPerPage);

    if (typeFilter) params.append("type", typeFilter);
    if (priceFilter) params.append("price", priceFilter);
    if (categoriaFilter) params.append("category", categoriaFilter);
    if (searchText) params.append("search", searchText);

    try {
      const res = await fetch(`http://localhost:3000/api/rooms?${params.toString()}`);
      const data = await res.json();

      totalPages = data.totalPages;
      currentPage = data.currentPage;
      displayRooms(data.rooms);
    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
      container.innerHTML = "<p>Error al cargar habitaciones.</p>";
    }
  }

  fetchRoomsFromBackend(currentPage);

  selectType.addEventListener('change', () => fetchRoomsFromBackend(1));
  selectPrice.addEventListener('change', () => fetchRoomsFromBackend(1));
  selectCategoria.addEventListener('change', () => fetchRoomsFromBackend(1));
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchRoomsFromBackend(1);
    }
  });
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetchRoomsFromBackend(1);
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("guest-modal").classList.add("hidden");
  });

  document.getElementById("guest-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const guestData = {
      first_name: document.getElementById("first-name").value,
      last_name: document.getElementById("last-name").value,
      dni: document.getElementById("dni").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      nationality: document.getElementById("nationality").value,
      userId: user.id
    };

    try {
      const guestRes = await fetch("http://localhost:3000/api/guests/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestData)
      });

      const guest = await guestRes.json();
      const roomId = localStorage.getItem("selectedRoomId");
      const checkIn = localStorage.getItem("checkInDate");
      const checkOut = localStorage.getItem("checkOutDate");

      const reservaRes = await fetch("http://localhost:3000/api/rooms/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          roomId,
          guestId: guest.id,
          checkIn,
          checkOut
        })
      });

      if (reservaRes.ok) {
        alert("Reserva realizada exitosamente.");
        window.location.href = "../reserva/reserva.html";
      } else {
        const errorData = await reservaRes.json();
        throw new Error(errorData.error || "Error al crear reserva.");
      }

    } catch (err) {
      console.error("Error durante la reserva:", err);
      alert("Error: " + err.message);
    }
  });

  document.getElementById("close-self-modal").addEventListener("click", () => {
    document.getElementById("self-modal").classList.add("hidden");
  });

  document.getElementById("self-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const roomId = localStorage.getItem("selectedRoomId");
    const checkIn = document.getElementById("self-checkin").value;
    const checkOut = document.getElementById("self-checkout").value;
    const people = parseInt(document.getElementById("self-people").value);

    if (!user || !user.id || !roomId || !checkIn || !checkOut || !people) {
      alert("Faltan datos para la reserva.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/rooms/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          roomId,
          guestId: null,
          checkIn,
          checkOut,
          people
        })
      });

      if (res.ok) {
        alert("Reserva realizada con éxito.");
        window.location.href = "../reserva/reserva.html";
      } else {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la reserva.");
      }
    } catch (err) {
      console.error("Error al reservar para mí:", err);
      alert("Error al reservar: " + err.message);
    }
  });
});
