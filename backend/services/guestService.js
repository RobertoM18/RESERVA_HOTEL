const pool = require('../db/connection');
const registrarBitacora = require('../utils/bitacoraLogger');

// Registrar huésped
const registerGuest = async (req, res) => {
  const { first_name, last_name, dni, email, phone, nationality } = req.body;
  const userId = req.query.userId;

  if (!first_name || !last_name || !dni || !email) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
z
  try {
    const result = await pool.query(`
      INSERT INTO guest (first_name, last_name, dni, email, phone, nationality)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [first_name, last_name, dni, email, phone || null, nationality || null]
    );

    await registrarBitacora({
      users_id: userId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'guest',
      tipo_accion: 'Crear',
      descripcion: `Registró huésped ${first_name} ${last_name}`,
      req
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al registrar huésped:", error.message);
    res.status(500).json({ error: "Error al registrar huésped" });
  }
};

// Obtener todos los huéspedes
const getGuests = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM guest ORDER BY created_at DESC`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener huéspedes:", error.message);
    res.status(500).json({ error: "Error al obtener lista de huéspedes" });
  }
};

module.exports = {
  registerGuest,
  getGuests
};
