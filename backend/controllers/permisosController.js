const pool = require('../db/connection');

// Obtener lista completa de permisos disponibles
const getPermisosDisponibles = async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM permissions ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    res.status(500).json({ error: 'Error al obtener permisos disponibles' });
  }
};

// Obtener permisos de un usuario específico
const getPermisosDeUsuario = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.name FROM user_permissions up
       JOIN permissions p ON p.id = up.permission_id
       WHERE up.user_id = $1`,
      [userId]
    );

    const permisos = result.rows.map(row => row.name);
    res.json(permisos);
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error);
    res.status(500).json({ error: 'Error al obtener permisos del usuario' });
  }
};

// Asignar nueva lista de permisos - PROCEDIMIENTO 1
const asignarPermisosAUsuario = async (req, res) => {
  const { user_id, permisos } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Obtener IDs de los permisos por nombre
    const result = await client.query(
      `SELECT id, name FROM permissions WHERE name = ANY($1)`,
      [permisos]
    );

    const permisosIds = result.rows;

    // Eliminar permisos actuales del usuario
    await client.query('DELETE FROM user_permissions WHERE user_id = $1', [user_id]);

    // Insertar nuevos permisos usando el procedimiento almacenado
    for (const permiso of permisosIds) {
      await client.query(
        `CALL asignar_permiso_usuario($1, $2, $3)`,
        [user_id, permiso.id, null]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al actualizar permisos:", error);
    res.status(500).json({ success: false, error: 'Error al actualizar permisos' });
  } finally {
    client.release();
  }
};
// Revocar un permiso específico de un usuario - PROCEDIMIENTO 2
  const revocarPermiso = async (req, res) => {
    const { user_id, permiso_id } = req.body;

    try {
      await pool.query(
        `CALL revocar_permiso_usuario($1, $2, $3)`,
        [user_id, permiso_id, null]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error al revocar permiso:", error);
      res.status(500).json({ success: false, error: 'Error al revocar permiso' });
    }
  };

module.exports = {
  getPermisosDisponibles,
  getPermisosDeUsuario,
  asignarPermisosAUsuario,
  revocarPermiso
};
