const pool = require('../db/connection');
const registrarBitacora = require('../utils/bitacoraLogger');

// Crear reserva
const createReservation = async (req, res) => {
  const { guest_id, room_id, entry_date, departure_date, people } = req.body;
  const userId = req.query.userId;

  if (!room_id || !entry_date || !departure_date) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const conflicto = await pool.query(
        `SELECT * FROM reservations
        WHERE room_id = $1 AND (
          ($2 BETWEEN entry_date AND departure_date) OR
          ($3 BETWEEN entry_date AND departure_date) OR
          (entry_date BETWEEN $2 AND $3)
        ) AND state = 'activa'`,
        [room_id, entry_date, departure_date]
      );


    if (conflicto.rows.length > 0) {
      return res.status(400).json({ error: "La habitación ya está reservada en esas fechas" });
    }

    const result = await pool.query(
      `INSERT INTO reservations (user_id, guest_id, room_id, entry_date, departure_date, people, state)
      VALUES ($1, $2, $3, $4, $5, $6,'activa')
      RETURNING *`,
      [userId, guest_id, room_id, entry_date, departure_date, people]
    );

    await registrarBitacora({
      users_id: userId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'reservations',
      tipo_accion: 'Crear',
      descripcion: guest_id
        ? `Creó reserva para huésped ${guest_id} en habitación ${room_id}`
        : `Creó reserva personal en habitación ${room_id}`,
      req,
      fecha_ingreso: entry_date,
      fecha_salida: departure_date
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear reserva:", error.message);
    res.status(500).json({ error: "Error al crear reserva" });
  }
};


// Obtener reservas de usuario
const getUserReservations = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, rt.name AS tipo, rm.name AS nombre_habitacion, rm.imagen
       FROM reservations r
       JOIN rooms rm ON r.room_id = rm.id
       JOIN room_types rt ON rm.type_id = rt.id
       WHERE r.state = 'activa' AND r.user_id = $1`,
      [id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener reservas:", error.message);
    res.status(500).json({ error: "Error al obtener reservas del usuario" });
  }
};

// Cancelar reserva
const cancelarReserva = async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;

  try {
    const result = await pool.query(
      `UPDATE reservations SET state = 'cancelada' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    await registrarBitacora({
      users_id: userId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'reservations',
      tipo_accion: 'Cancelar',
      descripcion: `Canceló la reserva ID ${id}`,
      req
    });

    res.status(200).json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error("Error al cancelar reserva:", error.message);
    res.status(500).json({ error: "Error al cancelar la reserva" });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  cancelarReserva
};
