const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const registrarBitacora = require('../utils/bitacoraLogger');

const getUsernameFromDB = async (userId) => {
  try {
    const result = await pool.query('SELECT newusername FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.newusername || 'desconocido';
  } catch (err) {
    console.error("Error al obtener username desde la base de datos:", err);
    return 'desconocido';
  }
};

//Registro de Usuario
    const registerUser = async (req, res) => {
    const { newUsername, newPassword, phone, email } = req.body;
    try {
      if (!newUsername || !newPassword) {
        return res.status(400).json({ error: 'Campos incompletos' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await pool.query(
        'INSERT INTO users (newusername, newpassword, phone, email, rol_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, newusername, email',
        [newUsername, hashedPassword, phone, email, 1]
      );

      // Registrar en bitácora la creación del usuario
      await registrarBitacora({
        users_id: result.rows[0].id,
        username: newUsername,
        tabla_afectada: 'users',
        tipo_accion: 'Registrar',
        descripcion: `Se registró el usuario ${newUsername} con email ${email}`,
        req
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        res.status(400).json({ error: 'El email ya está registrado' });
      } else {
        res.status(500).json({ error: 'Error al registrar usuario', user: req.body });
      }
    }
};


  //Login de Usuario
  const loginUser = async (req, res) => {
    const { newUsername, newPassword } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE newusername = $1', [newUsername]);

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(newPassword, user.newpassword);

      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

    // Registrar en bitácora el login
    await registrarBitacora({
      users_id: user.id,
      username: user.newusername,
      tabla_afectada: 'users',
      tipo_accion: 'Login',
      descripcion: `Inicio de sesión del usuario ${user.newusername}`,
      fecha_ingreso: new Date(),
      req
    });

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.newusername,
        rol_id: user.rol_id,
        guestId: user.guest_id || null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el login' });
  }
};

  //Registro de Usuario
 const logoutUser = async (req, res) => {
  const { userId, username } = req.query;

  try {
    await registrarBitacora({
      users_id: userId,
      username,
      tabla_afectada: 'users',
      tipo_accion: 'Logout',
      descripcion: `Cierre de sesión del usuario ${username}`,
      fecha_salida: new Date(),
      req
    });

    res.status(200).json({ message: "Logout registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar logout:", error);
    res.status(500).json({ error: "Error al registrar logout" });
  }
};

//Obtener todos los tipos de habitacion
const getAllRooms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rooms.*, room_types.name AS type
      FROM rooms
      JOIN room_types ON rooms.type_id = room_types.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al cargar habitaciones:", error.message);
    res.status(500).json({ message: "Error al cargar habitaciones" });
  }
};

const createReservation = async (req, res) => {
  const { userId, roomId, guestId, checkIn, checkOut, people } = req.body;

  if (!userId || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    const result = await pool.query(`
      INSERT INTO reservations (user_id, room_id, guest_id, entry_date, departure_date, people)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId,
      roomId,
      guestId || null,
      checkIn,
      checkOut,
      people || null
    ]);

    const username = await getUsernameFromDB(userId);

    await registrarBitacora({
      users_id: userId,
      username,
      tabla_afectada: 'reservations',
      tipo_accion: 'Crear',
      descripcion: `Reservó habitación ID ${roomId}`,
      req
    });



    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al guardar la reserva:", err);
    res.status(500).json({ error: "Error al guardar la reserva." });
  }
};
//Obtener reservas del usuario
const getUserReservations = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        reservations.id AS reservation_id,
        reservations.entry_date,
        reservations.departure_date,
        reservations.state,
        rooms.name AS room_name,
        rooms.imagen AS imagen,
        room_types.name AS room_type
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      JOIN room_types ON rooms.type_id = room_types.id
      WHERE reservations.user_id = $1
        AND reservations.state = 'activa'
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ error: "Error al obtener reservas del usuario." });
  }
};

//Cancelar Reserva
  const cancelarReserva = async (req, res) => {
  const reservaId = req.params.id;
  const { userId} = req.body;
  const username = await getUsernameFromDB(userId);

  try {
    const result = await pool.query(
      `UPDATE reservations SET state = 'cancelada' WHERE id = $1 RETURNING *`,
      [reservaId]
    );

    await registrarBitacora({
      users_id: userId,
      username,
      tabla_afectada: 'reservations',
      tipo_accion: 'Cancelar',
      descripcion: `Canceló la reserva ID ${reservaId}`,
      req
});

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al cancelar reserva:", err);
    res.status(500).json({ error: "Error al cancelar reserva." });
  }
};

//Extrae los datos del huesped del (datos del formulario al momento de registrarse)
const registerGuest = async (req, res) => {
  const { first_name, last_name, dni, email, phone, nationality } = req.body;
  if (!first_name || !last_name || !dni || !email || !phone || !nationality) {
    return res.status(400).json({ error: 'Faltan datos del huésped.' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO guest (first_name, last_name, dni, email, phone, nationality)
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id
    `, [first_name, last_name, dni, email, phone, nationality]);

    const guestId = result.rows[0].id;
    res.status(201).json({ id: guestId });
  } catch (error) {
    console.error("Error al registrar huésped:", error);
    res.status(500).json({ error: 'Error al registrar huésped.' });
  }
};
//Obtener los huespedes registrados
const getGuests = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guest');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener huéspedes:', error);
    res.status(500).json({ error: 'Error al obtener huéspedes.' });
  }
};
// Obtener habitaciones paginadas y filtradas
const getPaginatedRooms = async (req, res) => {
  const { page = 1, limit = 8, type, price, category, search } = req.query;
  const offset = (page - 1) * limit;

  const filters = [];
  const values = [];

  if (type) {
    values.push(type.toLowerCase());
    filters.push(`LOWER(rt.name) = $${values.length}`);
  }

  if (price) {
    const [min, max] = price.split("-").map(Number);
    values.push(min);
    filters.push(`r.price >= $${values.length}`);
    values.push(max);
    filters.push(`r.price <= $${values.length}`);
  }

  if (category) {
    values.push(parseInt(category));
    filters.push(`r.category = $${values.length}`);
  }

  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    filters.push(`LOWER(r.name) LIKE $${values.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.price,
        r.ability,
        r.available,
        r.category,
        r.imagen,
        rt.name AS type
      FROM rooms r
      JOIN room_types rt ON r.type_id = rt.id
      ${whereClause}
      ORDER BY r.id
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const result = await pool.query(query, [...values, parseInt(limit), parseInt(offset)]);

    const countQuery = `
      SELECT COUNT(*) FROM rooms r
      JOIN room_types rt ON r.type_id = rt.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const totalRooms = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRooms / limit);

    const rooms = result.rows.map(room => ({
      ...room,
      status: room.available ? 'Disponible' : 'No disponible'
    }));

    res.json({
      rooms,
      currentPage: parseInt(page),
      totalPages,
      totalRooms
    });
  } catch (error) {
    console.error("Error al obtener habitaciones filtradas:", error.message);
    res.status(500).json({ error: "Error al obtener habitaciones" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllRooms,
  logoutUser,
  createReservation,
  getUserReservations,
  cancelarReserva,
  registerGuest,
  getGuests,
  getPaginatedRooms
};
