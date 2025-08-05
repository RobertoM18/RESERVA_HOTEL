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
// Resetear contraseña de usuario - PROCEDIMIENTO 4
const resetearPasswordUsuario = async (userId, nuevaPasswordHash) => {
  await pool.query(`CALL resetear_password_usuario($1, $2, $3)`, [
    userId,
    nuevaPasswordHash,
    null
  ]);
};

const cambiarPassword = async (userId, passwordActual, nuevaPassword) => {
  const userResult = await pool.query('SELECT newpassword FROM users WHERE id = $1', [userId]);

  if (userResult.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const hashActual = userResult.rows[0].newpassword;
  const coincide = await bcrypt.compare(passwordActual, hashActual);

  if (!coincide) {
    throw new Error('La contraseña actual no es correcta');
  }

  const nuevaPasswordHash = await bcrypt.hash(nuevaPassword, 10);

  // Llamada al procedimiento
  await pool.query('CALL actualizar_password_usuario($1, $2)', [userId, nuevaPasswordHash]);

  return { success: true, message: 'Contraseña actualizada correctamente' };
};

module.exports = {
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  resetearPasswordUsuario,
  cambiarPassword
};
