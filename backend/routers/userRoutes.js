const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserReservations, cancelarReserva, cambiarPasswordUsuario} = require('../controllers/userControllers');

// Autenticación
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Reserva
router.get('/:id/reservas', getUserReservations);
router.put('/reservas/:id/cancelar', cancelarReserva);


router.post('/cambiar-password', cambiarPasswordUsuario);

module.exports = router;
