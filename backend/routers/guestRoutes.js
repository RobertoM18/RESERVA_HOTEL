const express = require('express');
const router = express.Router();
const { registerGuest, getGuests } = require('../controllers/userControllers');





router.post('/register', registerGuest);     // POST http://localhost:3000/api/guests/register
router.get('/', getGuests);                 // GET  http://localhost:3000/api/guests

module.exports = router;
