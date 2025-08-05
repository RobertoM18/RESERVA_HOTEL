--ASIGNAR PERMISO A USUARIO - 1
CREATE OR REPLACE PROCEDURE asignar_permiso_usuario(
  IN p_user_id INT,
  IN p_permiso_id INT,
  OUT mensaje TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el permiso ya está asignado
  IF EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_id = p_user_id AND permission_id = p_permiso_id
  ) THEN
    mensaje := 'El usuario ya tiene este permiso asignado.';
  ELSE
    -- Insertar el nuevo permiso
    INSERT INTO user_permissions (user_id, permission_id)
    VALUES (p_user_id, p_permiso_id);
    
    mensaje := 'Permiso asignado correctamente.';
  END IF;
END;
$$;

--Revocar PERMISO A USUARIO - 2
CREATE OR REPLACE PROCEDURE revocar_permiso_usuario(
  IN p_user_id INT,
  IN p_permiso_id INT,
  OUT mensaje TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el permiso existe para ese usuario
  IF EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_id = p_user_id AND permission_id = p_permiso_id
  ) THEN
    -- Eliminar el permiso
    DELETE FROM user_permissions
    WHERE user_id = p_user_id AND permission_id = p_permiso_id;

    mensaje := 'Permiso revocado correctamente.';
  ELSE
    mensaje := 'El usuario no tiene ese permiso asignado.';
  END IF;
END;
$$;

--CREAR HABITACION -3
CREATE OR REPLACE PROCEDURE crear_habitacion_completa(
  IN p_nombre TEXT,
  IN p_precio NUMERIC,
  IN p_capacidad INT,
  IN p_categoria INT,  -- corregido
  IN p_tipo_id INT,
  IN p_imagen TEXT,
  OUT mensaje TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM rooms WHERE name = p_nombre) THEN
    mensaje := 'Ya existe una habitación con ese nombre.';
  ELSE
    INSERT INTO rooms (name, price, ability, category, type_id, imagen, available)
    VALUES (p_nombre, p_precio, p_capacidad, p_categoria, p_tipo_id, p_imagen, true);

    mensaje := 'Habitación creada correctamente.';
  END IF;
END;
$$;

-- ACTUALIZA CONTRASEÑA DE USUARIO - 4
CREATE OR REPLACE PROCEDURE actualizar_password_usuario(
  p_user_id INTEGER,
  p_new_password TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET newpassword = p_new_password
  WHERE id = p_user_id;
END;
$$;