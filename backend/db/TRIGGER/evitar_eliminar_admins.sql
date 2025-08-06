CREATE OR REPLACE FUNCTION evitar_eliminar_admins()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.rol_id = 3 THEN
    RAISE EXCEPTION 'No se puede eliminar un usuario con rol de administrador.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevenir_eliminar_admin
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION evitar_eliminar_admins();

DELETE FROM users WHERE id = 34;

SELECT * FROM USERS;
