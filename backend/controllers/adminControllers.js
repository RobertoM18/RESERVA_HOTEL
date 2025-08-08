// backend/controllers/adminControllers.js
const { crearHabitacion } = require('../services/roomService');
const { crearUsuario, actualizarUsuario, eliminarUsuario, resetearPasswordUsuario} = require('../services/userService');
const pool = require('../db/connection');
const registrarBitacora = require('../utils/bitacoraLogger');
const { obtenerUsuariosPaginados} = require('../services/paginationService');
const { obtenerEstadisticas, obtenerTodosLosUsuarios, calcularIngresosTotales } = require('../services/statsService');
const { obtenerBitacoraPaginada } = require('../services/bitacoraService');
const { obtenerVistaResumenReservasService } = require('../services/viewService');
//Crear habitacion - PROCEDIMIENTO 3
const os = require('os'); // este import debe estar al inicio del archivo

const crearHabitacionDesdeProcedimiento = async (req, res) => {
  const datos = req.body;

  // Validar campos obligatorios
    if (Object.values(datos).some(val => val === undefined || val === null)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
      const userId = req.query.userId;
      const username = req.query.username;
      const navegador = req.headers['user-agent'] || 'desconocido';
      const ip = req.ip || req.connection?.remoteAddress || 'desconocida';
      const pcName = os.hostname();

      await crearHabitacion({
        ...datos,
        userId,
        username,
        navegador,
        ip,
        pcName
      });

      res.json({ success: true, message: 'Habitación creada correctamente.' });
    } catch (error) {
      console.error('Error al crear habitación:', error);
      res.status(500).json({ error: 'Error al crear la habitación' });
    }
  };

//Crear Usuario desde Admin
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
//Actualizar Usuario
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
// Eliminar Usuario -- trigger 4
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

    // Verifica si el error proviene del trigger que impide eliminar admins - TRIGER 4
    if (err.message.includes("No se puede eliminar un usuario con rol de administrador")) {
      return res.status(403).json({ error: "No puedes eliminar un usuario con rol administrador." });
    }

    // Otros errores
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

//Obtener usuarios paginados
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
//Obtener Bitacora paginada
const getBitacoraPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const { registros, total } = await obtenerBitacoraPaginada({ page, limit, search });

    res.status(200).json({
      success: true,
      data: registros,
      total
    });
  } catch (error) {
    console.error("Error al obtener bitácora paginada:", error.message);
    res.status(500).json({ error: 'Error al obtener bitácora paginada' });
  }
};
//Obtener estadisticas del sistema - funcion 2
const getStats = async (req, res) => {
  try {
    const stats = await obtenerEstadisticas();
    res.status(200).json(stats);
  } catch (err) {
    console.error("Error al obtener estadísticas:", err.message);
    res.status(500).json({ error: "Error al obtener estadísticas del sistema" });
  }
};
//Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await obtenerTodosLosUsuarios();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error.message);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};
//Obtener reservas activas por usuario - Funcion 1
const getReservasActivasUsuario = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

  try {
    const result = await pool.query('SELECT * FROM obtener_reservas_activas($1)', [userId]);
    res.json(result.rows); 
  } catch (err) {
    console.error("Error al obtener reservas activas:", err.message);
    res.status(500).json({ error: 'Error al obtener reservas activas' });
  }
};
//Calcular ingresos totales en un rango de fechas - funcion 4
const getIngresosTotales = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: "Faltan fechas" });
    }
    const total = await calcularIngresosTotales(fechaInicio, fechaFin);
    res.json({ total });
  } catch (err) {
    console.error("Error al calcular ingresos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
//Resetear contraseña de usuario - PROCEDIMIENTO 4
const resetearPassword = async (req, res) => {
  const { user_id, nueva_password_encriptada } = req.body;

  if (!user_id || !nueva_password_encriptada) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    await resetearPasswordUsuario(user_id, nueva_password_encriptada);
    res.json({ success: true, message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//VISTAS 1
const getVistaPermisosUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vista_permisos_usuarios');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener vista de permisos de usuarios:", error.message);
    res.status(500).json({ error: "Error al obtener datos" });
  }
};
//VISTAS 2
const obtenerVistaResumenReservas = async (req, res) => {
  try {
    const data = await obtenerVistaResumenReservasService();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la vista resumen de reservas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
module.exports = {
  crearHabitacionDesdeProcedimiento ,
  createUserFromAdmin,
  updateUser,
  deleteUser,
  getUsuariosPaginados,
  getBitacoraPaginated,
  getStats,
  getAllUsers,
  getReservasActivasUsuario,
  getIngresosTotales,
  resetearPassword,
  getVistaPermisosUsuarios,
  obtenerVistaResumenReservas  
};
