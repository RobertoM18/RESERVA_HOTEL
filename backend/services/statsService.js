const pool = require('../db/connection');

const obtenerEstadisticas = async () => {
  const totalReservas = await pool.query(`SELECT COUNT(*) FROM reservations`);
  const reservasActivas = await pool.query(`SELECT COUNT(*) FROM reservations WHERE state = 'activa'`);
  const reservasCanceladas = await pool.query(`SELECT COUNT(*) FROM reservations WHERE state = 'cancelada'`);
  const totalUsuarios = await pool.query(`SELECT COUNT(*) FROM users`);

  return {
    totalReservas: parseInt(totalReservas.rows[0].count),
    reservasActivas: parseInt(reservasActivas.rows[0].count),
    reservasCanceladas: parseInt(reservasCanceladas.rows[0].count),
    totalUsuarios: parseInt(totalUsuarios.rows[0].count),
  };
};

const obtenerTodosLosUsuarios = async () => {
  const result = await pool.query(`SELECT id, newusername, email, phone, rol_id FROM users ORDER BY id ASC`);
  return result.rows;
};

module.exports = {
  obtenerEstadisticas,
  obtenerTodosLosUsuarios,
};
