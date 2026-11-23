-- Lista de revocación de JWT (cierre de sesión con invalidación real).
-- Solo se guarda el identificador `jti` del token (UUID), nunca el JWT completo.
-- Migración aditiva: no modifica ni elimina tablas ni datos existentes.
CREATE TABLE "token_revocado" (
    "id_token_revocado" SERIAL NOT NULL,
    "jti" VARCHAR(64) NOT NULL,
    "revocado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "token_revocado_pkey" PRIMARY KEY ("id_token_revocado")
);

-- Unicidad del jti: garantiza que una revocación repetida no cree duplicados
-- y sirve como índice para la consulta del middleware en cada petición.
CREATE UNIQUE INDEX "token_revocado_jti_key" ON "token_revocado"("jti");

-- Apoya la limpieza de registros cuyo token original ya expiró.
CREATE INDEX "token_revocado_expira_en_idx" ON "token_revocado"("expira_en");
