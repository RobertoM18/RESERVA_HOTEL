// middlewares/isAdmin.js
const pool = require('../db/connection');

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.query.userId; // 👈 asegúrate de que es query, no body

    if (!userId) {
      return res.status(401).json({ error: "Falta userId" });
    }

    const result = await pool.query("SELECT rol_id FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0 || result.rows[0].rol_id !== 3) {
      return res.status(403).json({ error: "Acceso denegado. No eres administrador." });
    }

    next();
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error);
    res.status(500).json({ error: "Error interno del servidor al verificar rol." });
  }
};

module.exports = isAdmin;
