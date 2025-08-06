const pool = require('../db/connection');
const registrarBitacora = require('../utils/bitacoraLogger');

// Registrar huésped
//trigger 3
const registerGuest = async (req, res) => {
  let { first_name, last_name, dni, email, phone, nationality } = req.body;
  const userId = req.query.userId;

  // Limpiar espacios
  first_name = first_name?.trim();
  last_name = last_name?.trim();
  dni = dni?.trim();
  email = email?.trim();
  phone = phone?.trim();
  nationality = nationality?.trim();

  if (!first_name || !last_name || !dni || !email) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const existing = await pool.query('SELECT * FROM guest WHERE dni = $1', [dni]);

    if (existing.rows.length > 0) {
      return res.status(200).json({
        message: "Huésped ya registrado",
        guest: existing.rows[0]
      });
    }
    //trigger 1
    const result = await pool.query(
      `INSERT INTO guest (first_name, last_name, dni, email, phone, nationality)
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
