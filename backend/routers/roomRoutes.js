const express = require('express');
const router = express.Router();
const { getPaginatedRooms, createReservation } = require('../controllers/userControllers');

// Obtener habitaciones con filtros, búsqueda y paginación
router.get('/', getPaginatedRooms);

// Crear reserva
router.post('/reserva', createReservation);

module.exports = router;
// 