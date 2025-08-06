-- Elimina si ya existe - trigger 3
DROP TRIGGER IF EXISTS trigger_validar_reserva_cruzada ON reservations;
DROP FUNCTION IF EXISTS validar_reserva_cruzada();

-- Función del trigger
CREATE OR REPLACE FUNCTION validar_reserva_cruzada()
RETURNS TRIGGER AS $$
DECLARE
  conflicto INT;
BEGIN
  SELECT COUNT(*) INTO conflicto
  FROM reservations
  WHERE room_id = NEW.room_id
    AND (
      NEW.entry_date, NEW.departure_date
    ) OVERLAPS (
      entry_date, departure_date
    );

  IF conflicto > 0 THEN
    RAISE EXCEPTION 'Ya existe una reserva para esta habitación en ese rango de fechas';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
CREATE TRIGGER trigger_validar_reserva_cruzada
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION validar_reserva_cruzada();

-- Primer reserva
INSERT INTO reservations (user_id, room_id, guest_id, entry_date, departure_date)
VALUES (1, 23, 15, '2025-09-1', '2025-09-12');

-- Segunda reserva que se cruza en fechas con la anterior
INSERT INTO reservations (user_id, room_id, guest_id, entry_date, departure_date)
VALUES (1, 23, 15, '2025-09-10', '2025-08-20');
SELECT * FROM guest WHERE id = 7;


