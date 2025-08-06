-- TRIGGER ASOCIADO A LA FUNCIÓN -- trigger 2
CREATE TRIGGER trigger_validar_datos_huesped
BEFORE INSERT ON guest
FOR EACH ROW
EXECUTE FUNCTION validar_datos_huesped();
--TRIGGERS 2
CREATE OR REPLACE FUNCTION log_cambios_habitaciones()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id INT := current_setting('app.current_user_id')::INT;
  v_username TEXT := current_setting('app.current_username');
  v_navegador TEXT := current_setting('app.navegador', true);
  v_ip TEXT := current_setting('app.ip_address', true);
  v_pc TEXT := current_setting('app.pc_name', true);
BEGIN
  INSERT INTO bitacora (
    users_id, username, accion, tabla_afectada, descripcion,
    tipo_accion, fecha, navegador, ip_address, pc_name
  )
  VALUES (
    v_usuario_id,
    v_username,
    TG_OP,
    'rooms',
    CASE TG_OP
      WHEN 'INSERT' THEN 'Se creó una habitación'
      WHEN 'UPDATE' THEN 'Se actualizó una habitación'
      WHEN 'DELETE' THEN 'Se eliminó una habitación'
    END,
    TG_OP,
    now(),
    v_navegador,
    v_ip,
    v_pc
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger asociado
CREATE TRIGGER trigger_log_habitaciones
AFTER INSERT OR UPDATE OR DELETE ON rooms
FOR EACH ROW
EXECUTE FUNCTION log_cambios_habitaciones();