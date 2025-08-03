// backend/services/userService.js
const pool = require('../db/connection');
const bcrypt = require('bcrypt');

const crearUsuario = async ({ newusername, email, newpassword, phone, rol_id }) => {
  const hashed = await bcrypt.hash(newpassword, 10);
  const result = await pool.query(`
    INSERT INTO users (newusername, email, newpassword, phone, rol_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, newusername, email, phone, rol_id
  `, [newusername, email, hashed, phone || null, rol_id]);
  return result.rows[0];
};

const actualizarUsuario = async ({ id, newusername, email, phone, rol_id }) => {
  const result = await pool.query(`
    UPDATE users
    SET newusername = $1, email = $2, phone = $3, rol_id = $4
    WHERE id = $5
    RETURNING *`,
    [newusername, email, phone, rol_id, id]
  );
  return result.rows[0];
};

const eliminarUsuario = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};



module.exports = {
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
