const express = require('express'); 
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');

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
router.post('/crear-habitacion', isAdmin, createRoom);

// Estadísticas
router.get('/estadisticas', isAdmin, getStats);

// Gestión de usuarios
router.get('/usuarios', isAdmin, getAllUsers);
router.post('/usuarios', isAdmin, createUserFromAdmin); 
router.put('/usuarios/:id', isAdmin, updateUser);
router.delete('/usuarios/:id', isAdmin, deleteUser);
router.get('/usuarios-paginados', isAdmin, getUsuariosPaginados);

//Obtener bitacora (Solo admin)
router.get('/bitacora-paginada', isAdmin, getBitacoraPaginated);



module.exports = router;
