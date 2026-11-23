#!/bin/bash
# login-y-abrir.sh
# Hace login con curl y genera el código para pegar en el navegador

CORREO="${1:-pedro.gonzalez@gmail.com}"
PASSWORD="${2:-123456}"
BASE="http://localhost:3000"

echo "Haciendo login como $CORREO..."

RESP=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"$CORREO\",\"contrasena\":\"$PASSWORD\"}")

TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USUARIO=$(echo "$RESP" | grep -o '"usuario":{[^}]*}' | sed 's/"usuario"://')

if [ -z "$TOKEN" ]; then
  echo "[FALLO] No se obtuvo token"
  echo "$RESP"
  exit 1
fi

cat > /tmp/login-front.txt << EOF
localStorage.setItem('token', '$TOKEN');
localStorage.setItem('usuario', JSON.stringify($USUARIO));
location.reload();
EOF

echo "[OK] Login exitoso"
echo ""
echo "============================================================"
echo "Codigo para pegar en la consola del navegador (F12 -> Console):"
echo "============================================================"
echo ""
cat /tmp/login-front.txt
echo ""
echo "============================================================"