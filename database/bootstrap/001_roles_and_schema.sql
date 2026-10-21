-- Preparación inicial de roles, esquema y permisos.
--
-- Ejecutar como house_admin sobre la base de datos house.
-- Solo para un entorno nuevo: los roles y el esquema no deben existir.
-- Las contraseñas se asignan por separado y no se guardan en Git.

BEGIN;

-- Cuenta encargada de ejecutar las migraciones.
CREATE ROLE house_migrator
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

-- Cuenta que utilizará el backend.
CREATE ROLE house_app
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

-- Permitir la conexión a la base de datos.
-- Esto no concede permisos sobre tablas.
GRANT CONNECT ON DATABASE house
  TO house_migrator, house_app;

-- Impedir que cualquier rol cree objetos en el esquema public
-- mediante los permisos del grupo implícito PUBLIC.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- El migrador será propietario del esquema de la aplicación.
CREATE SCHEMA app AUTHORIZATION house_migrator;

-- La aplicación puede acceder al esquema, pero no crear objetos.
GRANT USAGE ON SCHEMA app TO house_app;

-- Esquema predeterminado para nuevas conexiones a house.
ALTER ROLE house_migrator IN DATABASE house
  SET search_path = app;

ALTER ROLE house_app IN DATABASE house
  SET search_path = app;

-- Permisos sobre futuras tablas creadas por house_migrator.
ALTER DEFAULT PRIVILEGES
  FOR ROLE house_migrator
  IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO house_app;

-- Permitir el uso de futuras secuencias creadas por house_migrator.
ALTER DEFAULT PRIVILEGES
  FOR ROLE house_migrator
  IN SCHEMA app
  GRANT USAGE ON SEQUENCES
  TO house_app;

  -- Historial de migraciones, separado de las tablas de negocio.
CREATE SCHEMA migrations AUTHORIZATION house_migrator;

COMMIT;