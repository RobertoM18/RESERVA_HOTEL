-- TRIGGERS 1
CREATE OR REPLACE FUNCTION validar_datos_huesped()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_name IS NULL OR TRIM(NEW.first_name) = '' THEN
    RAISE EXCEPTION 'El nombre del huésped es obligatorio';
  ELSIF NEW.last_name IS NULL OR TRIM(NEW.last_name) = '' THEN
    RAISE EXCEPTION 'El apellido del huésped es obligatorio';
  ELSIF NEW.dni IS NULL OR TRIM(NEW.dni) = '' THEN
    RAISE EXCEPTION 'El DNI del huésped es obligatorio';
  ELSIF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
    RAISE EXCEPTION 'El email del huésped es obligatorio';
  ELSIF NEW.nationality IS NULL OR TRIM(NEW.nationality) = '' THEN
    RAISE EXCEPTION 'La nacionalidad del huésped es obligatoria';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER ASOCIADO A LA FUNCIÓN
CREATE TRIGGER trigger_validar_datos_huesped
BEFORE INSERT ON guest
FOR EACH ROW
EXECUTE FUNCTION validar_datos_huesped();
