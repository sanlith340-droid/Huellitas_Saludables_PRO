-- Notificaciones persistentes en la aplicación (RF09).
-- Los vínculos con cita y disponibilidad son opcionales para conservar el aviso
-- aunque se elimine el recurso asociado; el destinatario sí conserva integridad referencial.
CREATE TABLE "notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_usuario" VARCHAR(10) NOT NULL,
    "tipo" VARCHAR(40) NOT NULL,
    "asunto" VARCHAR(150) NOT NULL,
    "mensaje" VARCHAR(500) NOT NULL,
    "id_cita" INTEGER,
    "id_disponibilidad" INTEGER,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leida_en" TIMESTAMPTZ(6),

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id_notificacion"),
    CONSTRAINT "notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notificacion_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "cita"("id_cita") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notificacion_id_disponibilidad_fkey" FOREIGN KEY ("id_disponibilidad") REFERENCES "disponibilidad"("id_disponibilidad") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "notificacion_id_usuario_fecha_creacion_idx" ON "notificacion"("id_usuario", "fecha_creacion");
CREATE INDEX "notificacion_id_usuario_leida_idx" ON "notificacion"("id_usuario", "leida");
