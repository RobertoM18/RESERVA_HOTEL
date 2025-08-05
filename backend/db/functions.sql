--Funcion para obtener las reservas activas de un usuario
CREATE OR REPLACE FUNCTION obtener_reservas_activas(p_user_id INT)
RETURNS TABLE (
  id INT,
  room_name TEXT,
  entry_date DATE,
  departure_date DATE,
  state TEXT,
  people INT,
  imagen TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    rm.name::text,
    r.entry_date,
    r.departure_date,
    r.state::text,
    r.people,
    rm.imagen::text
  FROM reservations r
  JOIN rooms rm ON r.room_id = rm.id
  WHERE r.user_id = p_user_id AND r.state = 'activa';
END;
$$ LANGUAGE plpgsql;

--Función: obtener_estadisticas_generales()
CREATE OR REPLACE FUNCTION obtener_habitaciones_disponibles(
  fecha_inicio DATE,
  fecha_fin DATE
)
RETURNS TABLE (
  id INT,
  name VARCHAR,
  type VARCHAR,
  price NUMERIC,
  ability INT,
  category INT,
  imagen VARCHAR
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name::VARCHAR,
    rt.name::VARCHAR AS type,
    r.price,
    r.ability,
    r.category,
    r.imagen::VARCHAR
  FROM rooms r
  JOIN room_types rt ON r.type_id = rt.id
  WHERE r.id NOT IN (
    SELECT room_id
    FROM reservations
    WHERE NOT (fecha_fin <= entry_date OR fecha_inicio >= departure_date)
  );
END;
$$ LANGUAGE plpgsql;
--Calcular el total de ingresos generados por reservas entre dos fechas
CREATE OR REPLACE FUNCTION calcular_ingresos(fecha_inicio DATE, fecha_fin DATE)
RETURNS NUMERIC AS $$
DECLARE
  total_ingresos NUMERIC;
BEGIN
  SELECT SUM(rm.price * (r.departure_date - r.entry_date))
  INTO total_ingresos
  FROM reservations r
  JOIN rooms rm ON r.room_id = rm.id
  WHERE r.entry_date >= fecha_inicio
    AND r.departure_date <= fecha_fin
    AND r.state = 'activa';

-- Si el resultado es NULL (es decir, no hay reservas), lo convertimos manualmente a 0
  IF total_ingresos IS NULL THEN
    total_ingresos := 0;
  END IF;

  RETURN total_ingresos;
END;
$$ LANGUAGE plpgsql;