-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "correo" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(150) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "especializacion" VARCHAR(100),
    "tipo" VARCHAR(20),
    "rol" VARCHAR(20) NOT NULL DEFAULT 'usuario',
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "raza" (
    "id_raza" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raza_pkey" PRIMARY KEY ("id_raza")
);

-- CreateTable
CREATE TABLE "mascota" (
    "id_mascota" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "especie" VARCHAR(50) NOT NULL,
    "genero" VARCHAR(20) NOT NULL,
    "id_raza" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mascota_pkey" PRIMARY KEY ("id_mascota")
);

-- CreateTable
CREATE TABLE "usuario_mascota" (
    "id_usuario" VARCHAR(10) NOT NULL,
    "id_mascota" INTEGER NOT NULL,

    CONSTRAINT "usuario_mascota_pkey" PRIMARY KEY ("id_usuario","id_mascota")
);

-- CreateTable
CREATE TABLE "disponibilidad" (
    "id_disponibilidad" SERIAL NOT NULL,
    "id_usuario" VARCHAR(10) NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'disponible',

    CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("id_disponibilidad")
);

-- CreateTable
CREATE TABLE "cita" (
    "id_cita" SERIAL NOT NULL,
    "id_recepcionista" VARCHAR(10) NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "id_disponibilidad" INTEGER NOT NULL,
    "motivo" VARCHAR(200) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "cita_pkey" PRIMARY KEY ("id_cita")
);

-- CreateTable
CREATE TABLE "historia_clinica" (
    "id_historia_clinica" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "peso" DECIMAL(5,2),
    "diagnostico" VARCHAR(200) NOT NULL,
    "tratamiento" VARCHAR(200) NOT NULL,
    "observaciones" VARCHAR(500),
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historia_clinica_pkey" PRIMARY KEY ("id_historia_clinica")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "uq_disponibilidad_usuario_fecha_hora" ON "disponibilidad"("id_usuario", "fecha", "hora");

-- CreateIndex
CREATE UNIQUE INDEX "historia_clinica_id_cita_key" ON "historia_clinica"("id_cita");

-- AddForeignKey
ALTER TABLE "mascota" ADD CONSTRAINT "mascota_id_raza_fkey" FOREIGN KEY ("id_raza") REFERENCES "raza"("id_raza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_mascota" ADD CONSTRAINT "usuario_mascota_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_mascota" ADD CONSTRAINT "usuario_mascota_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascota"("id_mascota") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad" ADD CONSTRAINT "disponibilidad_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_id_recepcionista_fkey" FOREIGN KEY ("id_recepcionista") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascota"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_id_disponibilidad_fkey" FOREIGN KEY ("id_disponibilidad") REFERENCES "disponibilidad"("id_disponibilidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historia_clinica" ADD CONSTRAINT "historia_clinica_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "cita"("id_cita") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Restricciones CHECK heredadas que Prisma schema no representa actualmente.
ALTER TABLE "usuario"
  ADD CONSTRAINT "chk_usuario_rol"
  CHECK ("rol" IN ('admin', 'recepcionista', 'especialista', 'usuario'));
ALTER TABLE "usuario"
  ADD CONSTRAINT "chk_usuario_tipo"
  CHECK ("tipo" IN ('principal', 'acudiente'));
ALTER TABLE "mascota"
  ADD CONSTRAINT "chk_mascota_especie"
  CHECK ("especie" IN ('perro', 'gato'));
ALTER TABLE "mascota"
  ADD CONSTRAINT "chk_mascota_genero"
  CHECK ("genero" IN ('macho', 'hembra'));
ALTER TABLE "disponibilidad"
  ADD CONSTRAINT "chk_disponibilidad_estado"
  CHECK ("estado" IN ('disponible', 'ocupado'));
ALTER TABLE "cita"
  ADD CONSTRAINT "chk_cita_estado"
  CHECK ("estado" IN ('pendiente', 'confirmado', 'cancelado', 'atendido'));
ALTER TABLE "historia_clinica"
  ADD CONSTRAINT "chk_historia_peso"
  CHECK ("peso" IS NULL OR "peso" > 0);

-- Un horario conserva citas canceladas, pero solo puede tener una cita activa.
CREATE UNIQUE INDEX "uq_cita_disponibilidad_activa"
  ON "cita" ("id_disponibilidad")
  WHERE "estado" <> 'cancelado';

-- Triggers del modelo PostgreSQL original.
CREATE OR REPLACE FUNCTION "actualizar_disponibilidad_cita"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "disponibilidad"
  SET "estado" = 'ocupado'
  WHERE "id_disponibilidad" = NEW."id_disponibilidad";
  RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_actualizar_disponibilidad_cita"
AFTER INSERT ON "cita"
FOR EACH ROW
EXECUTE FUNCTION "actualizar_disponibilidad_cita"();

CREATE OR REPLACE FUNCTION "actualizar_cita_atendida"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "cita"
  SET "estado" = 'atendido'
  WHERE "id_cita" = NEW."id_cita";
  RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_historia_cita_atendida"
AFTER INSERT ON "historia_clinica"
FOR EACH ROW
EXECUTE FUNCTION "actualizar_cita_atendida"();
