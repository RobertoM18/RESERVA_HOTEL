const pool = require('../db/connection');

const isAdmin = async (req, res, next) => {
  try {
    const userId = parseInt(req.query.userId || req.body.userId);
    console.log("🧪 Middleware isAdmin - userId recibido:", userId);

    if (!userId || isNaN(userId)) {
      console.warn("⚠️ Falta o es inválido el userId.");
      return res.status(401).json({ error: "Falta o es inválido el userId" });
    }

    const result = await pool.query("SELECT rol_id, newusername FROM users WHERE id = $1", [userId]);
    console.log("🔍 Resultado DB:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const rol = result.rows[0].rol_id;
    if (rol !== 3) {
      return res.status(403).json({ error: "Acceso denegado. No eres administrador." });
    }

    next();
  } catch (error) {
    console.error("❌ Error al verificar rol de administrador:", error);
    res.status(500).json({ error: "Error interno del servidor al verificar rol." });
  }
};

module.exports = isAdmin;
