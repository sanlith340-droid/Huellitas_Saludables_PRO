#!/bin/bash
# test-endpoints.sh
# Prueba todos los endpoints de la API con curl

BASE="http://localhost:3000"
SEP="============================================================"

ok()   { echo -e "\n[OK] $1"; }
fail() { echo -e "\n[FALLO] $1"; }
step() { echo -e "\n$SEP"; echo "$1"; echo "$SEP"; }
show() { echo "$1" | head -c 400; echo; }

extraer_token() {
  grep -o '"token":"[^"]*' | cut -d'"' -f4
}

# ============================================================
step "1. HEALTHCHECK - GET /health"
# ============================================================
RESP=$(curl -s $BASE/health)
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Healthcheck OK" || fail "Healthcheck fallo"

# ============================================================
step "2. LOGIN - POST /api/auth/login (4 roles)"
# ============================================================

RESP=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"pedro.gonzalez@gmail.com","contrasena":"123456"}')
TOKEN_USU=$(echo "$RESP" | extraer_token)
[ -n "$TOKEN_USU" ] && ok "Login usuario OK" || fail "Login usuario fallo"

RESP=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"alejandro.castillo@proyectohs.com","contrasena":"123456"}')
TOKEN_ESP=$(echo "$RESP" | extraer_token)
[ -n "$TOKEN_ESP" ] && ok "Login especialista OK" || fail "Login especialista fallo"

RESP=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"laura.gomez@proyectohs.com","contrasena":"123456"}')
TOKEN_REC=$(echo "$RESP" | extraer_token)
[ -n "$TOKEN_REC" ] && ok "Login recepcionista OK" || fail "Login recepcionista fallo"

RESP=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan.rodriguez@proyectohs.com","contrasena":"123456"}')
TOKEN_ADM=$(echo "$RESP" | extraer_token)
[ -n "$TOKEN_ADM" ] && ok "Login admin OK" || fail "Login admin fallo"

# ============================================================
step "3. PERFIL - GET /api/auth/perfil"
# ============================================================
RESP=$(curl -s $BASE/api/auth/perfil -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Perfil OK" || fail "Perfil fallo"

# ============================================================
step "4. SIN TOKEN - debe fallar (401)"
# ============================================================
RESP=$(curl -s $BASE/api/mascotas)
show "$RESP"
echo "$RESP" | grep -q 'UNAUTHORIZED' && ok "Rechazo correcto" || fail "Deberia rechazar"

# ============================================================
step "5. MASCOTAS - GET /api/mascotas"
# ============================================================
RESP=$(curl -s $BASE/api/mascotas -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Listar mascotas OK" || fail "Listar mascotas fallo"

# ============================================================
step "6. MASCOTA POR ID - GET /api/mascotas/1"
# ============================================================
RESP=$(curl -s $BASE/api/mascotas/1 -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Mascota 1 OK" || fail "Mascota 1 fallo"

# ============================================================
step "7. MASCOTA NO EXISTE - GET /api/mascotas/99999 (404)"
# ============================================================
RESP=$(curl -s $BASE/api/mascotas/99999 -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q 'NOT_FOUND' && ok "404 correcto" || fail "Deberia dar 404"

# ============================================================
step "8. MASCOTA ID INVALIDO - GET /api/mascotas/abc (400)"
# ============================================================
RESP=$(curl -s $BASE/api/mascotas/abc -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q 'BAD_REQUEST' && ok "400 correcto" || fail "Deberia dar 400"

# ============================================================
step "9. CREAR MASCOTA - POST /api/mascotas"
# ============================================================
RESP=$(curl -s -X POST $BASE/api/mascotas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USU" \
  -d "{\"nombre\":\"Test_$(date +%s)\",\"fecha_nacimiento\":\"2023-05-15\",\"especie\":\"perro\",\"genero\":\"macho\",\"id_raza\":1}")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Crear mascota OK" || fail "Crear mascota fallo"

# ============================================================
step "10. DISPONIBILIDAD - GET /api/disponibilidad"
# ============================================================
RESP=$(curl -s "$BASE/api/disponibilidad?id_usuario=ESP001" -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Listar disponibilidad OK" || fail "Listar disponibilidad fallo"

# ============================================================
step "11. DISPONIBILIDAD POR ID - GET /api/disponibilidad/2"
# ============================================================
RESP=$(curl -s $BASE/api/disponibilidad/2 -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Disponibilidad 2 OK" || fail "Disponibilidad 2 fallo"

# ============================================================
step "12. CREAR DISPONIBILIDAD - POST (recepcionista)"
# ============================================================
RESP=$(curl -s -X POST $BASE/api/disponibilidad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_REC" \
  -d '{"id_usuario":"ESP001","fecha":"2026-12-01","hora":"14:00:00"}')
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Crear disponibilidad OK" || fail "Crear disponibilidad fallo"

# ============================================================
step "13. USUARIO NO PUEDE CREAR DISPONIBILIDAD (403)"
# ============================================================
RESP=$(curl -s -X POST $BASE/api/disponibilidad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USU" \
  -d '{"id_usuario":"ESP001","fecha":"2026-12-02","hora":"10:00:00"}')
show "$RESP"
echo "$RESP" | grep -q 'FORBIDDEN' && ok "Rechazo correcto" || fail "Deberia rechazar"

# ============================================================
step "14. CITAS - GET /api/citas"
# ============================================================
RESP=$(curl -s $BASE/api/citas -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Listar citas OK" || fail "Listar citas fallo"

# ============================================================
step "15. CREAR CITA - POST /api/citas"
# ============================================================
RESP=$(curl -s -X POST $BASE/api/citas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USU" \
  -d '{"id_mascota":1,"id_disponibilidad":3,"motivo":"Consulta general"}')
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Crear cita OK" || fail "Crear cita fallo"

ID_CITA=$(echo "$RESP" | grep -o '"id_cita":[0-9]*' | cut -d: -f2)

# ============================================================
step "16. CANCELAR CITA - PATCH /api/citas/:id/cancelar"
# ============================================================
if [ -n "$ID_CITA" ]; then
  RESP=$(curl -s -X PATCH $BASE/api/citas/$ID_CITA/cancelar -H "Authorization: Bearer $TOKEN_USU")
  show "$RESP"
  echo "$RESP" | grep -q 'cancelado' && ok "Cancelar cita OK" || fail "Cancelar cita fallo"
else
  fail "No se pudo obtener el id_cita"
fi

# ============================================================
step "17. USUARIOS ESPECIALISTAS - GET /api/usuarios/especialistas"
# ============================================================
RESP=$(curl -s $BASE/api/usuarios/especialistas -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Listar especialistas OK" || fail "Listar especialistas fallo"

# ============================================================
step "18. USUARIO POR DOCUMENTO - GET /api/usuarios/USU001"
# ============================================================
RESP=$(curl -s $BASE/api/usuarios/USU001 -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Usuario USU001 OK" || fail "Usuario USU001 fallo"

# ============================================================
step "19. HISTORIA - GET /api/historia (especialista)"
# ============================================================
RESP=$(curl -s $BASE/api/historia -H "Authorization: Bearer $TOKEN_ESP")
show "$RESP"
echo "$RESP" | grep -q '"success":true' && ok "Listar historias OK" || fail "Listar historias fallo"

# ============================================================
step "20. USUARIO NO PUEDE VER HISTORIA (403)"
# ============================================================
RESP=$(curl -s $BASE/api/historia -H "Authorization: Bearer $TOKEN_USU")
show "$RESP"
echo "$RESP" | grep -q 'FORBIDDEN' && ok "Rechazo correcto" || fail "Deberia rechazar"

# ============================================================
step "RESUMEN"
# ============================================================
echo "Todos los endpoints fueron probados."
echo "Revisa los [OK] y [FALLO] arriba."