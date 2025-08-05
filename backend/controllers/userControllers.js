// backend/controllers/userControllers.js
const { registerUser, loginUser, logoutUser } = require('../services/authService');
const { createReservation, getUserReservations, cancelarReserva } = require('../services/reservationService');
const { registerGuest, getGuests } = require('../services/guestService');
const { getPaginatedRooms, getAllRooms, obtenerHabitacionesDisponibles} = require('../services/roomService');
// Obtener las habitaciones dispoibles. - funcion 3
const getHabitacionesDisponibles = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "Debe especificar fecha_inicio y fecha_fin" });
  }

  try {
    const habitaciones = await obtenerHabitacionesDisponibles(fecha_inicio, fecha_fin);
    res.status(200).json(habitaciones);
  } catch (error) {
    console.error("Error al obtener habitaciones disponibles:", error.message);
    res.status(500).json({ error: "Error interno" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getAllRooms,
  createReservation,
  getUserReservations,
  cancelarReserva,
  registerGuest,
  getGuests,
  getPaginatedRooms,
  getHabitacionesDisponibles
};
