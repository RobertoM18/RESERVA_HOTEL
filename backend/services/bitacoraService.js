const pool = require('../db/connection');

async function obtenerBitacoraPaginada({ page = 1, limit = 10, search = '' }) {
  const offset = (page - 1) * limit;
  const searchQuery = `%${search.toLowerCase()}%`;

  const result = await pool.query(
    `SELECT * FROM bitacora
     WHERE LOWER(username) LIKE $1
     ORDER BY fecha DESC
     LIMIT $2 OFFSET $3`,
    [searchQuery, limit, offset]
  );

  const total = await pool.query(
    `SELECT COUNT(*) FROM bitacora
     WHERE LOWER(username) LIKE $1`,
    [searchQuery]
  );

  return {
    registros: result.rows,
    total: parseInt(total.rows[0].count)
  };
}

module.exports = {
  obtenerBitacoraPaginada
};