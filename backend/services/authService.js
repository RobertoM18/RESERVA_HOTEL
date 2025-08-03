const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const registrarBitacora = require('../utils/bitacoraLogger');

// Registro de usuario
const registerUser = async (req, res) => {
  const { newUsername, newPassword, phone, email } = req.body;

  if (!newUsername || !newPassword || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const existe = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const existeUsername = await pool.query('SELECT * FROM users WHERE newusername = $1', [newUsername]);
    if (existeUsername.rows.length > 0) {
    return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(`
      INSERT INTO users (newusername, newpassword, phone, email, rol_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, newusername, email, phone, rol_id
    `, [newUsername, hashedPassword, phone || null, email, 1]);

    await registrarBitacora({
      users_id: result.rows[0].id,
      username: newUsername,
      tabla_afectada: 'users',
      tipo_accion: 'Registro',
      descripcion: 'Usuario registrado',
      req
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Login de usuario
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE newusername = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.newpassword);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    await registrarBitacora({
      users_id: user.id,
      username: user.newusername,
      tabla_afectada: 'users',
      tipo_accion: 'Login',
      descripcion: 'Inicio de sesión',
      req
    });

    res.status(200).json({
      id: user.id,
      newusername: user.newusername,
      email: user.email,
      phone: user.phone,
      rol_id: user.rol_id
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
};

// Logout de usuario
const logoutUser = async (req, res) => {
  const { userId, username } = req.query;

  try {
    await registrarBitacora({
      users_id: userId,
      username: username || 'desconocido',
      tabla_afectada: 'users',
      tipo_accion: 'Logout',
      descripcion: 'Cierre de sesión',
      req
    });

    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error.message);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
