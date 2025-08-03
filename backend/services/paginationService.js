const pool = require('../db/connection');

const obtenerUsuariosPaginados = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;
  const filtro = search?.toLowerCase() || "";

  const result = await pool.query(`
    SELECT id, newusername, email, phone, rol_id 
    FROM users 
    WHERE LOWER(newusername) LIKE $1 OR LOWER(email) LIKE $1
    ORDER BY id ASC
    LIMIT $2 OFFSET $3`,
    [`%${filtro}%`, limit, offset]
  );

  const totalResult = await pool.query(`
    SELECT COUNT(*) FROM users 
    WHERE LOWER(newusername) LIKE $1 OR LOWER(email) LIKE $1`,
    [`%${filtro}%`]
  );

  const total = parseInt(totalResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  return {
    usuarios: result.rows,
    totalPages,
    currentPage: page,
  };
};

const obtenerBitacoraPaginada = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;
  const filtro = search?.toLowerCase() || "";

  const baseCountQuery = `SELECT COUNT(*) FROM bitacora`;
  const baseDataQuery = `
    SELECT id, username, tipo_accion, descripcion, fecha_ingreso, fecha_salida,
           ip_address, navegador, pc_name, tabla_afectada
    FROM bitacora`;

  let registrosResult, totalResult;
  let values = [];
  let whereClause = "";

  if (filtro) {
    values = [`%${filtro}%`];
    whereClause = `
      WHERE LOWER(username) LIKE $1
         OR LOWER(tipo_accion) LIKE $1
         OR LOWER(descripcion) LIKE $1
         OR LOWER(tabla_afectada) LIKE $1`;
    
    totalResult = await pool.query(`${baseCountQuery} ${whereClause}`, values);
    registrosResult = await pool.query(
      `${baseDataQuery} ${whereClause} ORDER BY fecha_ingreso ASC LIMIT $2 OFFSET $3`,
      [...values, limit, offset]
    );
  } else {
    totalResult = await pool.query(baseCountQuery);
    registrosResult = await pool.query(
      `${baseDataQuery} ORDER BY fecha_ingreso ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  }

  const totalRows = parseInt(totalResult.rows[0].count);
  const totalPages = Math.ceil(totalRows / limit);

  return {
    registros: registrosResult.rows,
    totalPages,
    currentPage: page,
  };
};

module.exports = {
  obtenerUsuariosPaginados,
  obtenerBitacoraPaginada,
};
