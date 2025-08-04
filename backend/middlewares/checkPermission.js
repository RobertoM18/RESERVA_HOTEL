const pool = require('../db/connection');

async function obtenerPermisosDeUsuario(userId) {
  const result = await pool.query(
    `SELECT p.name
     FROM user_permissions up
     JOIN permissions p ON p.id = up.permission_id
     WHERE up.user_id = $1`,
    [userId]
  );
  return result.rows.map(row => row.name);
}

function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const userId = req.query.userId || req.body.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const permisos = await obtenerPermisosDeUsuario(userId);

      if (!permisos.includes(requiredPermission)) {
        return res.status(403).json({ error: 'Permiso denegado' });
      }

      next();
    } catch (err) {
      console.error("Error al verificar permisos:", err.message);
      res.status(500).json({ error: 'Error interno de permisos' });
    }
  };
}

module.exports = { checkPermission };
