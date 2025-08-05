const pool = require('../db/connection');

// Crear una habitación
const crearHabitacion = async ({ name, price, ability, imagen, category, type_id }) => {
  const result = await pool.query(`
    INSERT INTO rooms (name, price, ability, imagen, category, type_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [name, price, ability, imagen, category, type_id]
  );
  return result.rows[0];
};

// Obtener todas las habitaciones (sin filtros ni paginación)
const getAllRooms = async () => {
  const result = await pool.query(`
    SELECT r.*, t.name AS type
    FROM rooms r
    JOIN room_types t ON r.type_id = t.id
    ORDER BY r.id ASC
  `);
  return result.rows;
};

// Obtener habitaciones con filtros y paginación
const getPaginatedRooms = async ({
  page = 1,
  limit = 10,
  search = '',
  type = '',
  minPrice = 0,
  maxPrice = 9999,
  category = ''}) => {
  const offset = (page - 1) * limit;
  const filtros = [];
  const valores = [];

  if (search) {
    valores.push(`%${search.toLowerCase()}%`);
    filtros.push(`LOWER(r.name) LIKE $${valores.length}`);
  }

    if (type && !isNaN(type)) {
      valores.push(parseInt(type));
      filtros.push(`r.type_id = $${valores.length}`);
    }


      if (!isNaN(minPrice)) {
      valores.push(parseFloat(minPrice));
      filtros.push(`r.price >= $${valores.length}`);
      }
      if (!isNaN(maxPrice)) {
        valores.push(parseFloat(maxPrice));
        filtros.push(`r.price <= $${valores.length}`);
      }

      if (category && !isNaN(category)) {
        valores.push(parseInt(category));
        filtros.push(`r.category = $${valores.length}`);
      }

      
  const whereClause = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const dataQuery = `
    SELECT r.*, t.name AS type
    FROM rooms r
    JOIN room_types t ON r.type_id = t.id
    ${whereClause}
    ORDER BY r.id ASC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM rooms r
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, valores);
  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  valores.push(limit, offset);
  const result = await pool.query(dataQuery, valores);

  return {
    rooms: result.rows,
    totalPages,
    currentPage: page
  };
};
// Funcion para obtener habitaciones disponibles. funcion 3
const obtenerHabitacionesDisponibles = async (fechaInicio, fechaFin) => {
  const result = await pool.query(
    'SELECT * FROM obtener_habitaciones_disponibles($1, $2)',
    [fechaInicio, fechaFin]
  );
  return result.rows;
};

module.exports = {
  crearHabitacion,
  getAllRooms,
  getPaginatedRooms,
  obtenerHabitacionesDisponibles
};
