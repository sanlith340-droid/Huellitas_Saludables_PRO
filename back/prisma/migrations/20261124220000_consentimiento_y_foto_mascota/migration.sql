-- Aceptación explícita de documentos legales en el registro público.
-- Las cuentas preexistentes y las creadas por administración conservan NULL.
ALTER TABLE "usuario"
  ADD COLUMN "fecha_aceptacion_politicas" TIMESTAMPTZ(6),
  ADD COLUMN "version_politicas_aceptadas" VARCHAR(40);

-- URL HTTPS opcional de la fotografía de la mascota.
ALTER TABLE "mascota"
  ADD COLUMN "foto_url" VARCHAR(2048);
