-- CreateTable
CREATE TABLE "password_reset_token" (
    "id_token_reset" SERIAL NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "id_usuario" VARCHAR(10) NOT NULL,
    "expira_en" TIMESTAMPTZ(6) NOT NULL,
    "usado_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id_token_reset")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_hash_key" ON "password_reset_token"("token_hash");
CREATE INDEX "password_reset_token_id_usuario_idx" ON "password_reset_token"("id_usuario");
CREATE INDEX "password_reset_token_expira_en_idx" ON "password_reset_token"("expira_en");

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
