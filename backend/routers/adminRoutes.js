const express = require('express'); 
const router = express.Router();

const isAdmin = require('../middlewares/isAdmin');
const { checkPermission } = require('../middlewares/checkPermission');
const { getReservasActivasUsuario } = require('../controllers/adminControllers');

const {
  getPermisosDisponibles,
  getPermisosDeUsuario,
  asignarPermisosAUsuario,
  revocarPermiso
} = require('../controllers/permisosController');

const { 
  crearHabitacionDesdeProcedimiento , 
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  createUserFromAdmin,
  getBitacoraPaginated,
  getUsuariosPaginados,
  getIngresosTotales,
  resetearPassword           
} = require('../controllers/adminControllers');

// Gestión de habitaciones
router.post(
  '/crear-habitacion', 
  isAdmin, 
  checkPermission('CREATE_ROOM'), 
  crearHabitacionDesdeProcedimiento 
);

// Estadísticas
router.get(
  '/estadisticas', 
  isAdmin, 
  checkPermission('VIEW_STATS'), 
  getStats
);

// Gestión de usuarios
router.get(
  '/usuarios', 
  isAdmin, 
  checkPermission('READ_USER'), 
  getAllUsers
);

router.post(
  '/usuarios', 
  isAdmin, 
  checkPermission('CREATE_USER'), 
  createUserFromAdmin
);

router.put(
  '/usuarios/:id', 
  isAdmin, 
  checkPermission('UPDATE_USER'), 
  updateUser
);

router.delete(
  '/usuarios/:id', 
  isAdmin, 
  checkPermission('DELETE_USER'), 
  deleteUser
);

router.get(
  '/usuarios-paginados', 
  isAdmin, 
  checkPermission('READ_USER'), 
  getUsuariosPaginados
);

// Bitácora
router.get(
  '/bitacora-paginada', 
  isAdmin, 
  checkPermission('VIEW_BITACORA'), 
  getBitacoraPaginated
);

// Gestión de permisos
router.get(
  '/permisos-disponibles',
  isAdmin,
  checkPermission('MANAGE_PERMISSIONS'),
  getPermisosDisponibles
);

router.get(
  '/permisos-usuario/:userId',
  isAdmin,
  checkPermission('MANAGE_PERMISSIONS'),
  getPermisosDeUsuario
);

router.post(
  '/permisos',
  isAdmin,
  checkPermission('MANAGE_PERMISSIONS'),
  asignarPermisosAUsuario
);

router.post(
  '/permisos/revocar',
  isAdmin,
  checkPermission('MANAGE_PERMISSIONS'),
  revocarPermiso
);

router.get('/ingresos', isAdmin, getIngresosTotales);

router.get('/reservas-activas/:id', isAdmin , getReservasActivasUsuario);

router.post(
  '/resetear-password',
  isAdmin,
  checkPermission('UPDATE_USER'),
  resetearPassword
);


module.exports = router;
