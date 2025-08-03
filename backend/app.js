// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routers/userRoutes');
const roomRoutes = require('./routers/roomRoutes');
const guestRoutes = require('./routers/guestRoutes');
const adminRoutes = require('./routers/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/admin', adminRoutes);
// Servir imágenes desde ../src/assets
app.use('/assets', express.static(path.resolve(__dirname, '../src/assets')));

// Servir archivos estáticos como login.html, room.html, etc.
app.use(express.static(path.join(__dirname, '../')));

// Fallback para SPA
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

module.exports = app;



module.exports = app;
