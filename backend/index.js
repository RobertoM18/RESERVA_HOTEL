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

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);

// Rutas protegidas de administrador
app.use('/api/admin', adminRoutes);

// Servir archivos estáticos (como imágenes)
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
