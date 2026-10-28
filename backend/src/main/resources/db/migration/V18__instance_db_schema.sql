-- V17: Agregar campo db_schema a la tabla instances
ALTER TABLE instances ADD COLUMN IF NOT EXISTS db_schema VARCHAR(100);
