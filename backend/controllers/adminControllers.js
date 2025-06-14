const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const registrarBitacora = require('../utils/bitacoraLogger');

// Crear una nueva habitación
const createRoom = async (req, res) => {
  const adminId = req.query.userId;
  const { name, price, ability, imagen, category, type_id } = req.body;

  if (!name || !price || !ability || !imagen || !category || !type_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO rooms (name, price, ability, imagen, category, type_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, price, ability, imagen, category, type_id]);

      await registrarBitacora({
        users_id: adminId,
        username: req.query.username || 'admin', // Asegúrate de enviar el nombre en la query
        tabla_afectada: 'rooms',
        tipo_accion: 'Crear',
        descripcion: `Creó habitación: ${name}`,
        req
      });


    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear habitación:', error);
    res.status(500).json({ error: 'Error al crear habitación.' });
  }
};

// Obtener estadísticas básicas
const getStats = async (req, res) => {
  try {
    const totalReservas = await pool.query(`SELECT COUNT(*) FROM reservations`);
    const reservasActivas = await pool.query(`SELECT COUNT(*) FROM reservations WHERE state = 'activa'`);
    const reservasCanceladas = await pool.query(`SELECT COUNT(*) FROM reservations WHERE state = 'cancelada'`);
    const totalUsuarios = await pool.query(`SELECT COUNT(*) FROM users`);
    const habitaciones = await pool.query(`SELECT COUNT(*) FROM rooms`);

    res.json({
      totalReservas: totalReservas.rows[0].count,
      reservasActivas: reservasActivas.rows[0].count,
      reservasCanceladas: reservasCanceladas.rows[0].count,
      totalUsuarios: totalUsuarios.rows[0].count,
      habitacionesRegistradas: habitaciones.rows[0].count
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, newusername, email, phone, rol_id FROM users ORDER BY id'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err.message);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Crear usuario desde el panel admin
const createUserFromAdmin = async (req, res) => {
  const adminId = req.query.userId;
  const { newusername, email, newpassword, phone, rol_id } = req.body;

  if (!newusername || !email || !newpassword || !rol_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const existe = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    const result = await pool.query(`
      INSERT INTO users (newusername, email, newpassword, phone, rol_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, newusername, email, phone, rol_id
    `, [newusername, email, hashedPassword, phone || null, rol_id]);

   

      await registrarBitacora({
        users_id: adminId,
        username: req.query.username || 'desconocido',
        tabla_afectada: 'users',
        tipo_accion: 'Crear',
        descripcion: `Creó usuario: ${newusername}`,
        req
      });


    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear usuario desde admin:", err);
    res.status(500).json({ error: "Error interno al crear usuario" });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  const adminId = req.query.userId;
  const { id } = req.params;
  const { newusername, email, phone, rol_id } = req.body;

  if (!newusername || !email || !rol_id) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET newusername = $1, email = $2, phone = $3, rol_id = $4 WHERE id = $5 RETURNING *`,
      [newusername, email, phone, rol_id, id]
    );

    await registrarBitacora({
      users_id: adminId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'users',
      tipo_accion: 'Actualizar',
      descripcion: `Actualizó usuario ID ${id}, nuevo username: ${newusername}`,
      req
    });


    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar usuario:", err.message);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  const adminId = req.query.userId;
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    await registrarBitacora({
      users_id: adminId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'users',
      tipo_accion: 'Eliminar',
      descripcion: `Eliminó usuario con ID ${id}`,
      req
    });


    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err.message);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// Obtener usuarios paginados
  const getUsuariosPaginados = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search?.toLowerCase() || "";

  try {
    const result = await pool.query(
      `SELECT id, newusername, email, phone, rol_id 
       FROM users 
       WHERE LOWER(newusername) LIKE $1 OR LOWER(email) LIKE $1
       ORDER BY id ASC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM users 
       WHERE LOWER(newusername) LIKE $1 OR LOWER(email) LIKE $1`,
      [`%${search}%`]
    );

    const total = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      usuarios: result.rows,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error al obtener usuarios paginados con búsqueda:", error.message);
    res.status(500).json({ error: 'Error al obtener usuarios paginados' });
  }
};



// Obtener bitácora
      const getBitacoraPaginated = async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search?.trim() || "";

      try {
        let registrosResult, totalResult;
        let totalPages = 1;

        const baseCountQuery = `SELECT COUNT(*) FROM bitacora`;
        const baseDataQuery = `
          SELECT id, username, tipo_accion, descripcion, fecha_ingreso, fecha_salida, ip_address, navegador, pc_name, tabla_afectada
          FROM bitacora
        `;

        if (search !== "") {
          const searchTerm = `%${search.toLowerCase()}%`;

          const whereClause = `
            WHERE LOWER(username) LIKE $1
              OR LOWER(tipo_accion) LIKE $1
              OR LOWER(descripcion) LIKE $1
              OR LOWER(tabla_afectada) LIKE $1
          `;

          totalResult = await pool.query(`${baseCountQuery} ${whereClause}`, [searchTerm]);
          registrosResult = await pool.query(
            `${baseDataQuery} ${whereClause} ORDER BY fecha_ingreso ASC LIMIT $2 OFFSET $3`,
            [searchTerm, limit, offset]
          );
        } else {
          totalResult = await pool.query(baseCountQuery);
          registrosResult = await pool.query(
            `${baseDataQuery} ORDER BY fecha_ingreso ASC LIMIT $1 OFFSET $2`,
            [limit, offset]
          );
        }

        const totalRows = parseInt(totalResult.rows[0].count);
        totalPages = Math.ceil(totalRows / limit);

        res.json({
          registros: registrosResult.rows,
          totalPages,
          currentPage: page,
        });
      } catch (error) {
        console.error("Error al obtener bitácora paginada:", error);
        res.status(500).json({ error: 'Error al obtener bitácora paginada' });
      }
    };



module.exports = {
  createRoom,
  getStats,
  getAllUsers,
  createUserFromAdmin,
  updateUser,
  deleteUser,
  getBitacoraPaginated, 
  getUsuariosPaginados
};
