const pool = require('../db/connection');

const registrarBitacora = async (userId, accion, descripcion) => {
  try {
    await pool.query(
      `INSERT INTO bitacora (users_id, accion, descripcion) VALUES ($1, $2, $3)`,
      [userId, accion, descripcion]
    );
  } catch (err) {
    console.error("❌ Error al registrar en bitácora:", err.message);
    // No se lanza el error para no afectar la operación principal
  }
};

module.exports = registrarBitacora;
