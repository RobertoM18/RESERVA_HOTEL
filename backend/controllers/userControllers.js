// backend/controllers/userControllers.js
const { registerUser, loginUser, logoutUser } = require('../services/authService');
const { createReservation, getUserReservations, cancelarReserva } = require('../services/reservationService');
const { registerGuest, getGuests } = require('../services/guestService');
const { getPaginatedRooms, getAllRooms } = require('../services/roomService');

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
  getPaginatedRooms
};
