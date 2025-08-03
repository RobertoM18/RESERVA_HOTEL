// backend/controllers/adminControllers.js
const { crearHabitacion } = require('../services/roomService');
const { crearUsuario, actualizarUsuario, eliminarUsuario } = require('../services/userService');
const pool = require('../db/connection');
const registrarBitacora = require('../utils/bitacoraLogger');
const { obtenerUsuariosPaginados, obtenerBitacoraPaginada } = require('../services/paginationService');
const { obtenerEstadisticas, obtenerTodosLosUsuarios } = require('../services/statsService');



const createRoom = async (req, res) => {
  const adminId = req.query.userId;
  const datos = req.body;

  if (Object.values(datos).some(val => !val)) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    const room = await crearHabitacion(datos);
    await registrarBitacora({
      users_id: adminId,
      username: req.query.username || 'admin',
      tabla_afectada: 'rooms',
      tipo_accion: 'Crear',
      descripcion: `Creó habitación: ${datos.name}`,
      req
    });
    res.status(201).json(room);
  } catch (err) {
    console.error("Error al crear habitación:", err);
    res.status(500).json({ error: "Error al crear habitación" });
  }
};

const createUserFromAdmin = async (req, res) => {
  const adminId = req.query.userId;
  const datos = req.body;

  if (!datos.newusername || !datos.email || !datos.newpassword || !datos.rol_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const existe = await pool.query('SELECT * FROM users WHERE email = $1', [datos.email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const nuevoUsuario = await crearUsuario(datos);
    await registrarBitacora({
      users_id: adminId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'users',
      tipo_accion: 'Crear',
      descripcion: `Creó usuario: ${datos.newusername}`,
      req
    });
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error("Error al crear usuario desde admin:", err);
    res.status(500).json({ error: "Error interno al crear usuario" });
  }
};

const updateUser = async (req, res) => {
  const adminId = req.query.userId;
  const { id } = req.params;
  const datos = req.body;

  if (!datos.newusername || !datos.email || !datos.rol_id) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const usuarioActualizado = await actualizarUsuario({ id, ...datos });

    await registrarBitacora({
      users_id: adminId,
      username: req.query.username || 'desconocido',
      tabla_afectada: 'users',
      tipo_accion: 'Actualizar',
      descripcion: `Actualizó usuario ID ${id}, nuevo username: ${datos.newusername}`,
      req
    });

    res.status(200).json(usuarioActualizado);
  } catch (err) {
    console.error("Error al actualizar usuario:", err.message);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

const deleteUser = async (req, res) => {
  const adminId = req.query.userId;
  const { id } = req.params;

  try {
    await eliminarUsuario(id);

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

const getUsuariosPaginados = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const resultado = await obtenerUsuariosPaginados({ page, limit, search });
    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener usuarios paginados:", error.message);
    res.status(500).json({ error: 'Error al obtener usuarios paginados' });
  }
};

const getBitacoraPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const resultado = await obtenerBitacoraPaginada({ page, limit, search });
    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener bitácora paginada:", error.message);
    res.status(500).json({ error: 'Error al obtener bitácora paginada' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await obtenerEstadisticas();
    res.status(200).json(stats);
  } catch (err) {
    console.error("Error al obtener estadísticas:", err.message);
    res.status(500).json({ error: "Error al obtener estadísticas del sistema" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await obtenerTodosLosUsuarios();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error.message);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};


module.exports = {
  createRoom,
  createUserFromAdmin,
  updateUser,
  deleteUser,
  getUsuariosPaginados,
  getBitacoraPaginated,
  getStats,
  getAllUsers
};
