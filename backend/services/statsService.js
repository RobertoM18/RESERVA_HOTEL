const pool = require('../db/connection');
//Obtener estadisticas generales - funcion 2
const obtenerEstadisticas = async () => {
  const result = await pool.query('SELECT * FROM obtener_estadisticas_generales()');
  return result.rows[0]; 
};
// Obtener todos los usuarios
const obtenerTodosLosUsuarios = async () => {
  const result = await pool.query(`SELECT id, newusername, email, phone, rol_id FROM users ORDER BY id ASC`);
  return result.rows;
};
// Contar reservas activas de un usuario específico - funcion 1
const contarReservasActivas = async (userId) => {
  const result = await pool.query('SELECT contar_reservas_activas_usuario($1) AS total', [userId]);
  return result.rows[0].total;
};
//Calcular ingresos totales en un rango de fechas - funcion 4
const calcularIngresosTotales = async (fechaInicio, fechaFin) => {
  const result = await pool.query(
    'SELECT calcular_ingresos($1, $2) AS total_ingresos',
    [fechaInicio, fechaFin]
  );
  return result.rows[0].total_ingresos;
};

module.exports = {
  obtenerEstadisticas,
  obtenerTodosLosUsuarios,
  contarReservasActivas,
  calcularIngresosTotales 
};
