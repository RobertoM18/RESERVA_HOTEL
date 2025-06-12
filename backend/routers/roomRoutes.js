const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { getPaginatedRooms, createReservation } = require('../controllers/userControllers');


// GET /api/rooms
router.get('/', getPaginatedRooms, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.price,
        r.ability,
        r.available,
        r.category,
        r.imagen,
        rt.name AS type
      FROM rooms r
      JOIN room_types rt ON r.type_id = rt.id
    `;

    const result = await pool.query(query);

    const rooms = result.rows.map(room => ({
      ...room,
      status: room.available ? 'Disponible' : 'No disponible'
    }));

    res.json(rooms);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/reserva', createReservation);

module.exports = router;
