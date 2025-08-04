// admin.js 

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.rol_id !== 3) {
    alert("Acceso denegado. Solo administradores.");
    window.location.href = "../login/login.html";
    return;
  }

    const userId = user.id;
    const username = user.newusername;

  document.getElementById("admin-panel").style.display = "block";

  //Logout
      document.getElementById("logout").addEventListener("click", async () => {
      try {
        await fetch(`http://localhost:3000/api/users/logout?userId=${userId}&username=${username}`, {
          method: "POST"
        });
      } catch (err) {
        console.error("Error al registrar logout:", err);
      }

      localStorage.clear();
      window.location.href = "../login/login.html";
    });


  // ================== CREAR HABITACIÓN ==================
  document.getElementById("form-crear-habitacion").addEventListener("submit", async (e) => {
    e.preventDefault();
    const habitacion = {
      name: document.getElementById("name").value,
      price: document.getElementById("price").value,
      ability: document.getElementById("ability").value,
      imagen: document.getElementById("imagen").value,
      category: document.getElementById("category").value,
      type_id: document.getElementById("type_id").value,
      userId
    };

    try {
        const res = await fetch(`http://localhost:3000/api/admin/crear-habitacion?userId=${userId}&username=${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitacion)
      });
      if (!res.ok) throw new Error("No autorizado o error en datos");
      const data = await res.json();
      alert("Habitación creada: " + data.name);
      e.target.reset();
    } catch (err) {
      alert("Error al crear habitación: " + err.message);
    }
  });

  // ================== ESTADÍSTICAS ==================
  const btnEstadisticas = document.getElementById("btn-estadisticas");
  const divEstadisticas = document.getElementById("estadisticas");
  let estadisticasCargadas = false;

  btnEstadisticas.addEventListener("click", async () => {
    if (divEstadisticas.style.display === "none" || divEstadisticas.innerHTML === "") {
      divEstadisticas.style.display = "block";
      btnEstadisticas.innerHTML = "Ocultar estadísticas";
      if (!estadisticasCargadas) {
        await cargarEstadisticas();
        estadisticasCargadas = true;
      }
    } else {
      divEstadisticas.style.display = "none";
      btnEstadisticas.innerHTML = "Ver estadísticas";
    }
  });

  async function cargarEstadisticas() {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/estadisticas?userId=${userId}&username=${username}`);
      const stats = await res.json();
      if (!res.ok) throw new Error(stats.error || "Acceso denegado");
      divEstadisticas.innerHTML = `
        <p>Total de usuarios: ${stats.totalUsuarios}</p>
        <p>Reservas activas: ${stats.reservasActivas}</p>
        <p>Reservas canceladas: ${stats.reservasCanceladas}</p>
        <p>Total de reservas: ${stats.totalReservas}</p>
        <p>Habitaciones registradas: ${stats.habitacionesRegistradas}</p>
      `;
    } catch (err) {
      alert("Error al obtener estadísticas: " + err.message);
    }
  }

  // ================== GESTIÓN DE USUARIOS ==================
  const btnCargarUsuarios = document.getElementById("btn-cargar-usuarios");
  const seccionUsuarios = document.querySelector(".seccion-usuarios");
  const inputBuscarUsuario = document.getElementById("input-buscar-usuario");

  let usuariosPaginaActual = 1;
  let usuariosTotalPaginas = 1;
  let filtroBusqueda = "";

  btnCargarUsuarios.addEventListener("click", async () => {
    if (seccionUsuarios.style.display === "none") {
      seccionUsuarios.style.display = "block";
      btnCargarUsuarios.innerHTML = "Ocultar usuarios";
      await cargarUsuariosPaginados();
    } else {
      seccionUsuarios.style.display = "none";
      btnCargarUsuarios.innerHTML = "Cargar usuarios";
    }
  });

    inputBuscarUsuario.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      filtroBusqueda = e.target.value.trim();
      usuariosPaginaActual = 1;
      await cargarUsuariosPaginados();
    }
  });

//OBTENER USUARIOS PAGINADOS
  async function cargarUsuariosPaginados() {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/usuarios-paginados?page=${usuariosPaginaActual}&limit=10&search=${encodeURIComponent(filtroBusqueda)}&userId=${userId}&username=${username}`);
      const { usuarios, totalPages, currentPage } = await res.json();
      usuariosPaginaActual = currentPage;
      usuariosTotalPaginas = totalPages;

      const tbody = document.querySelector("#tabla-usuarios tbody");
      tbody.innerHTML = "";

      usuarios.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td><input type="text" value="${user.newusername}" data-id="${user.id}" class="edit-username" disabled></td>
          <td><input type="email" value="${user.email}" data-id="${user.id}" class="edit-email" disabled></td>
          <td>
            <select data-id="${user.id}" class="edit-rol" disabled>
              <option value="1" ${user.rol_id === 1 ? 'selected' : ''}>Usuario</option>
              <option value="3" ${user.rol_id === 3 ? 'selected' : ''}>Administrador</option>
            </select>
          </td>
          <td><input type="text" value="${user.phone || ''}" data-id="${user.id}" class="edit-phone" disabled></td>
          <td>
            <button class="btn-editar" data-id="${user.id}">✏️</button>
            <button class="btn-guardar" data-id="${user.id}" style="display:none;">💾</button>
            <button class="btn-eliminar" data-id="${user.id}">🗑️</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      renderizarPaginacionUsuarios();
      activarEventosUsuarios();
    } catch (err) {
      alert("Error al cargar usuarios: " + err.message);
    }
  }

  function renderizarPaginacionUsuarios() {
    const contenedor = document.getElementById("usuarios-pagination");
    contenedor.innerHTML = "";

    const crearBoton = (texto, disabled, handler, extraClass = "") => {
      const btn = document.createElement("button");
      btn.textContent = texto;
      btn.disabled = disabled;
      btn.className = `pagination-btn ${extraClass}`;
      btn.addEventListener("click", handler);
      return btn;
    };

    contenedor.appendChild(crearBoton("⏮️", usuariosPaginaActual === 1, () => {
      usuariosPaginaActual = 1;
      cargarUsuariosPaginados();
    }));

    contenedor.appendChild(crearBoton("◀️", usuariosPaginaActual === 1, () => {
      usuariosPaginaActual--;
      cargarUsuariosPaginados();
    }));

    for (let i = 1; i <= usuariosTotalPaginas; i++) {
      contenedor.appendChild(crearBoton(i, false, () => {
        usuariosPaginaActual = i;
        cargarUsuariosPaginados();
      }, i === usuariosPaginaActual ? "active" : ""));
    }

    contenedor.appendChild(crearBoton("▶️", usuariosPaginaActual === usuariosTotalPaginas, () => {
      usuariosPaginaActual++;
      cargarUsuariosPaginados();
    }));

    contenedor.appendChild(crearBoton("⏭️", usuariosPaginaActual === usuariosTotalPaginas, () => {
      usuariosPaginaActual = usuariosTotalPaginas;
      cargarUsuariosPaginados();
    }));
  }
  function activarEventosUsuarios() {
    document.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        document.querySelector(`.edit-username[data-id="${id}"]`).disabled = false;
        document.querySelector(`.edit-email[data-id="${id}"]`).disabled = false;
        document.querySelector(`.edit-phone[data-id="${id}"]`).disabled = false;
        document.querySelector(`.edit-rol[data-id="${id}"]`).disabled = false;
        btn.style.display = "none";
        document.querySelector(`.btn-guardar[data-id="${id}"]`).style.display = "inline-block";
      });
    });

    document.querySelectorAll(".btn-guardar").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const username = document.querySelector(`.edit-username[data-id="${id}"]`).value;
        const email = document.querySelector(`.edit-email[data-id="${id}"]`).value;
        const phone = document.querySelector(`.edit-phone[data-id="${id}"]`).value;
        const rol_id = document.querySelector(`.edit-rol[data-id="${id}"]`).value;

        try {
          const res = await fetch(`http://localhost:3000/api/admin/usuarios/${id}?userId=${userId}&username=${username}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newusername: username, email, phone, rol_id: parseInt(rol_id) })
          });

          if (!res.ok) throw new Error("Error al actualizar");

          document.querySelector(`.edit-username[data-id="${id}"]`).disabled = true;
          document.querySelector(`.edit-email[data-id="${id}"]`).disabled = true;
          document.querySelector(`.edit-phone[data-id="${id}"]`).disabled = true;
          document.querySelector(`.edit-rol[data-id="${id}"]`).disabled = true;

          btn.style.display = "none";
          document.querySelector(`.btn-editar[data-id="${id}"]`).style.display = "inline-block";
          alert("Usuario actualizado");
        } catch (err) {
          alert("Error: " + err.message);
        }
      });
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

        try {
          const res = await fetch(`http://localhost:3000/api/admin/usuarios/${id}?userId=${userId}&username=${username}`, {
            method: "DELETE"
          });
          if (!res.ok) throw new Error("Error al eliminar");
          alert("Usuario eliminado");
          btn.closest("tr").remove();
        } catch (err) {
          alert("Error: " + err.message);
        }
      });
    });
  }

  // ================== NUEVO USUARIO ==================
  const btnNuevoUsuario = document.getElementById("btn-nuevo-usuario");
  const formCrearUsuario = document.getElementById("form-crear-usuario");

  btnNuevoUsuario.addEventListener("click", () => {
    formCrearUsuario.style.display = formCrearUsuario.style.display === "none" ? "block" : "none";
  });

  formCrearUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById("nuevo-nombre").value.trim();
    const email = document.getElementById("nuevo-email").value.trim();
    const password = document.getElementById("nuevo-password").value;
    const phone = document.getElementById("nuevo-phone").value.trim();
    const rol_id = parseInt(document.getElementById("nuevo-rol").value);

    if (!newUsername || !email || !password) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/admin/usuarios?userId=${userId}&username=${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newusername: newUsername, email, newpassword: password, phone, rol_id })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "No se pudo crear el usuario");

      alert("Usuario creado exitosamente");
      formCrearUsuario.reset();
      formCrearUsuario.style.display = "none";
      await cargarUsuariosPaginados();
    } catch (err) {
      alert("Error al crear usuario: " + err.message);
    }
  });

  // ================== BITÁCORA DEL SISTEMA ==================
let paginaActual = 1;
let totalPaginas = 1;
let filtroBitacora = "";

const btnBitacora = document.getElementById("btn-cargar-bitacora");
const seccionBitacora = document.getElementById("seccion-bitacora");
const paginationContainer = document.getElementById("bitacora-pagination-numbers");

if (btnBitacora && seccionBitacora) {
  btnBitacora.addEventListener("click", async () => {
    if (seccionBitacora.style.display === "none") {
      seccionBitacora.style.display = "block";
      btnBitacora.innerText = "Ocultar bitácora";
      await cargarBitacoraPaginada();
    } else {
      seccionBitacora.style.display = "none";
      btnBitacora.innerText = "Ver bitácora";
    }
  });
}

async function cargarBitacoraPaginada() {
  try {
    const res = await fetch(`http://localhost:3000/api/admin/bitacora-paginada?page=${paginaActual}&limit=10&search=${encodeURIComponent(filtroBitacora)}&userId=${userId}`);
    const data = await res.json();

    const tbody = document.querySelector("#tabla-bitacora tbody");
    tbody.innerHTML = "";

    if (Array.isArray(data.data)) {
      data.data.forEach((r, index) => {
        const numero = (paginaActual - 1) * 10 + index + 1;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${numero}</td>
          <td>${r.username}</td>
          <td>${r.fecha_ingreso ? new Date(r.fecha_ingreso).toLocaleString() : '-'}</td>
          <td>${r.fecha_salida ? new Date(r.fecha_salida).toLocaleString() : '-'}</td>
          <td>${r.navegador}</td>
          <td>${r.ip_address}</td>
          <td>${r.pc_name}</td>
          <td>${r.tabla_afectada}</td>
          <td>${r.tipo_accion}</td>
          <td>${r.descripcion}</td>
        `;
        tbody.appendChild(tr);
      });

      totalPaginas = Math.ceil(data.total / 10);
      renderPaginationNumbers();
    } else {
      alert("Error al cargar bitácora: datos no válidos");
    }

  } catch (err) {
    alert("Error al cargar bitácora: " + err.message);
  }
}

function renderPaginationNumbers() {
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === paginaActual) ? "active" : "";
    btn.addEventListener("click", () => {
      paginaActual = i;
      cargarBitacoraPaginada();
    });
    paginationContainer.appendChild(btn);
  }
}

// Eventos para búsqueda y navegación
document.getElementById("btn-buscar-bitacora").addEventListener("click", async () => {
  const input = document.getElementById("input-buscar-bitacora").value.trim();
  filtroBitacora = input;
  paginaActual = 1;
  await cargarBitacoraPaginada();
});

document.getElementById("bitacora-first-page").addEventListener("click", () => {
  if (paginaActual !== 1) {
    paginaActual = 1;
    cargarBitacoraPaginada();
  }
});

document.getElementById("bitacora-last-page").addEventListener("click", () => {
  if (paginaActual !== totalPaginas) {
    paginaActual = totalPaginas;
    cargarBitacoraPaginada();
  }
});

document.getElementById("bitacora-prev-page").addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    cargarBitacoraPaginada();
  }
});

document.getElementById("bitacora-next-page").addEventListener("click", () => {
  if (paginaActual < totalPaginas) {
    paginaActual++;
    cargarBitacoraPaginada();
  }
});

const btnPermisos = document.getElementById("btn-cargar-permisos");
const seccionPermisos = document.getElementById("seccion-permisos");
const selectUser = document.getElementById("select-user");
const checkboxesContainer = document.getElementById("permisos-checkboxes");

btnPermisos.addEventListener("click", async () => {
  if (seccionPermisos.style.display === "none") {
    seccionPermisos.style.display = "block";
    btnPermisos.innerText = "Ocultar gestión de permisos";
    await cargarUsuariosEnSelect();
    await cargarPermisosDisponibles();
  } else {
    seccionPermisos.style.display = "none";
    btnPermisos.innerText = "Ver gestión de permisos";
  }
});

async function cargarUsuariosEnSelect() {
  const res = await fetch(`http://localhost:3000/api/admin/usuarios?userId=${user.id}&username=${username}`);
  const users = await res.json();
  selectUser.innerHTML = '<option value="">Seleccione un usuario</option>';
  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.newusername} (${user.email})`;
    selectUser.appendChild(option);
  });
}

async function cargarPermisosDisponibles() {
  const res = await fetch(`http://localhost:3000/api/admin/permisos-disponibles?userId=${user.id}&username=${username}`);
  const permisos = await res.json();
  checkboxesContainer.innerHTML = "";
  permisos.forEach(p => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${p.name}" class="permiso-checkbox" /> ${p.name}
    `;
    checkboxesContainer.appendChild(label);
    checkboxesContainer.appendChild(document.createElement("br"));
  });
}

// Cargar permisos actuales cuando se selecciona un usuario
selectUser.addEventListener("change", async () => {
  const userId = selectUser.value;
  if (!userId) return;

  const res = await fetch(`http://localhost:3000/api/admin/permisos-usuario/${userId}?userId=${user.id}&username=${username}`);
  const permisosUsuario = await res.json();

  document.querySelectorAll(".permiso-checkbox").forEach(checkbox => {
    checkbox.checked = permisosUsuario.includes(checkbox.value);
  });
});

// Guardar cambios
document.getElementById("guardar-permisos").addEventListener("click", async () => {
  const userId = selectUser.value;
  if (!userId) return alert("Seleccione un usuario");

  const permisosMarcados = Array.from(document.querySelectorAll(".permiso-checkbox"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const res = await fetch(`http://localhost:3000/api/admin/permisos?userId=${user.id}&username=${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, permisos: permisosMarcados })
    });


  const result = await res.json();
  if (result.success) {
    alert("Permisos actualizados");
  } else {
    alert("Error al actualizar permisos");
  }
});
  
});
