CREATE TABLE "cita_cancelacion" (
    "id_cancelacion" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "id_usuario_actor" VARCHAR(10),
    "rol_actor" VARCHAR(20) NOT NULL,
    "origen" VARCHAR(20) NOT NULL,
    "motivo" VARCHAR(255) NOT NULL,
    "cancelada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cita_cancelacion_pkey" PRIMARY KEY ("id_cancelacion"),
    CONSTRAINT "cita_cancelacion_origen_check" CHECK ("origen" IN ('manual', 'automatico')),
    CONSTRAINT "cita_cancelacion_cita_fkey" FOREIGN KEY ("id_cita")
      REFERENCES "cita"("id_cita") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "cita_cancelacion_id_cita_key"
  ON "cita_cancelacion"("id_cita");

CREATE INDEX "cita_cancelacion_cancelada_en_idx"
  ON "cita_cancelacion"("cancelada_en");
