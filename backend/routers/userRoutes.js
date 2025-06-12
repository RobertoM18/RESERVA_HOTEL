const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserReservations, cancelarReserva} = require('../controllers/userControllers');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/:id/reservas', getUserReservations);
router.put('/reservas/:id/cancelar', cancelarReserva);

module.exports = router;
