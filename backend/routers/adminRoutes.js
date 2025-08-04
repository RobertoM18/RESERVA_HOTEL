const express = require('express'); 
const router = express.Router();

const isAdmin = require('../middlewares/isAdmin');
const { checkPermission } = require('../middlewares/checkPermission');

const {
  getPermisosDisponibles,
  getPermisosDeUsuario,
  asignarPermisosAUsuario
} = require('../controllers/permisosController');

const { 
  createRoom, 
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  createUserFromAdmin,
  getBitacoraPaginated,
  getUsuariosPaginados 
} = require('../controllers/adminControllers');

// Gestión de habitaciones
router.post(
  '/crear-habitacion', 
  isAdmin, 
  checkPermission('CREATE_ROOM'), 
  createRoom
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

module.exports = router;
