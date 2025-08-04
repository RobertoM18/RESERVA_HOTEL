const pool = require('../db/connection');

const registrarBitacora = async ({
  users_id,
  username,
  tabla_afectada,
  tipo_accion,
  descripcion,
  req,
  fecha_ingreso = null,
  fecha_salida = null,
}) => {
  try {
    if (!users_id || !tabla_afectada || !tipo_accion) {
      console.warn("Faltan datos obligatorios para registrar en bitácora.");
      return;
    }

    const safeUsername = username || 'desconocido';
    const navegador = req?.headers?.['user-agent'] || 'Desconocido';
    const ip = req?.ip || req?.connection?.remoteAddress || 'Desconocida';
    const pc = req?.hostname || 'Desconocida';
    const ingreso = fecha_ingreso || new Date();

    await pool.query(`
      INSERT INTO bitacora (
        users_id,
        username,
        fecha_ingreso,
        fecha_salida,
        navegador,
        ip_address,
        pc_name,
        tabla_afectada,
        tipo_accion,
        descripcion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      users_id,
      safeUsername,
      ingreso,
      fecha_salida,
      navegador,
      ip,
      pc,
      tabla_afectada,
      tipo_accion,
      descripcion
    ]);
  } catch (error) {
    console.error("Error al registrar en bitácora:", error);
  }
};

module.exports = registrarBitacora;
