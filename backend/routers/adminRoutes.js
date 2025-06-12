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

// Crear habitación (solo admin)
router.post('/crear-habitacion', isAdmin, createRoom);

// Obtener estadísticas (solo admin)
router.get('/estadisticas', isAdmin, getStats);

// 📋 CRUD de usuarios (solo admin)
router.get('/usuarios', isAdmin, getAllUsers);
router.post('/usuarios', isAdmin, createUserFromAdmin); // ✅ nueva ruta
router.put('/usuarios/:id', isAdmin, updateUser);
router.delete('/usuarios/:id', isAdmin, deleteUser);

//Obtener bitacora (Solo admin)
router.get('/bitacora-paginada', isAdmin, getBitacoraPaginated);
//Obtener usuarios paginados
router.get('/usuarios-paginados', isAdmin, getUsuariosPaginados);


module.exports = router;
