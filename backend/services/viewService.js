const pool = require('../db/connection');
//vistas 2
const obtenerVistaResumenReservasService = async () => {
  const result = await pool.query('SELECT * FROM vista_resumen_reservas');
  return result.rows;
};

module.exports = {
  obtenerVistaResumenReservasService
};
