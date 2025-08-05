const express = require('express');
const router = express.Router();
const { getPaginatedRooms, createReservation, getHabitacionesDisponibles} = require('../controllers/userControllers');

router.get('/', async (req, res) => {
  try {
    const result = await getPaginatedRooms(req.query);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ error: "Error interno al obtener habitaciones" });
  }
});

router.post('/reserva', createReservation);
router.get('/disponibles', getHabitacionesDisponibles);

module.exports = router;
