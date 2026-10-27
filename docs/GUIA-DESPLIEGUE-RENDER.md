# Guía de despliegue en Render — Huellitas Saludables PRO

Orden: **1) Base de datos → 2) Backend → 3) Frontend → 4) Ajustar CORS → 5) Pruebas → 6) QR.**
Escribe en un bloc de notas las URLs que Render te vaya dando; las vas a necesitar.

## Antes de empezar
- Sube tu código a GitHub (rama `Feria-SG` o la que uses). Los archivos `.env` NO se suben (ya están ignorados).
- Genera un `JWT_SECRET` nuevo, largo y solo para producción. En Linux: `openssl rand -hex 48`.

## 1. Base de datos (PostgreSQL)
1. Render → **New +** → **PostgreSQL**. Nombre y base: `huellitas` (puedes cambiarlo). Región: elige una y **usa la misma para el backend**.
2. Cuando termine, copia la **Internal Database URL** (la que empieza por `postgresql://`).
3. Los planes gratuitos de Render tienen límites (por ejemplo, caducan). Revisa el plan vigente en Render antes de la feria.

## 2. Backend (Web Service con Docker)
1. **New +** → **Web Service** → conecta tu repositorio.
2. Configura:
   - **Language/Runtime:** Docker
   - **Root Directory:** `back`
   - **Health Check Path:** `/health`
3. Variables de entorno (**Environment**):

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | la Internal Database URL del paso 1 |
| `JWT_SECRET` | el secreto nuevo |
| `JWT_EXPIRES_IN` | `10h` |
| `CORS_ORIGIN` | por ahora `https://temporal.invalid` (se corrige en el paso 4) |
| `DB_SEED` | `false` |

   No pongas `PORT`: Render lo asigna y el servidor ya lo lee.
4. **Create Web Service.** Al arrancar, el contenedor espera a PostgreSQL y ejecuta las migraciones solo (`docker-entrypoint.sh`). En los **Logs** debes ver `Conexión con PostgreSQL establecida` y las migraciones aplicadas.
5. Prueba: abre `https://TU-BACKEND.onrender.com/health` → debe responder "Servicio y base de datos activos".

## 3. Frontend (Static Site)
1. **New +** → **Static Site** → mismo repositorio.
2. Configura:
   - **Root Directory:** `front`
   - **Build Command:** `npm ci --include=dev && npm run build`
   - **Publish Directory:** `dist`
3. Variable de entorno (se usa al compilar):
   - `VITE_API_URL` = `https://TU-BACKEND.onrender.com/api`  (con `/api` al final)
4. **Redirects/Rewrites** → agrega: **Source** `/*`, **Destination** `/index.html`, **Action** `Rewrite`.
   Sin esto, al recargar una ruta interna (como `/login`) aparece "Not Found".
5. Si cambias `VITE_API_URL` después, hay que volver a desplegar el frontend.

## 4. Ajustar CORS
En el backend, cambia `CORS_ORIGIN` a la URL exacta del frontend: `https://TU-FRONTEND.onrender.com` (sin `/` al final, sin `*`). Guarda; Render reinicia el servicio.

## 5. Datos iniciales (decisión importante)
Con `DB_SEED=false` la base queda vacía: **no hay razas ni administrador**, y sin razas no se pueden registrar mascotas. Opciones:
- **Demo para la feria:** desde tu computador, con la **External Database URL** (termina con `?sslmode=require`), ejecuta una sola vez dentro de `back/`:
  `NODE_ENV=production DATABASE_URL="<externa>" npx sequelize-cli db:seed:all`
  ⚠️ Esto crea usuarios de demostración con contraseña `123456` (incluido un admin). Cámbialas o bórralos después de la feria.
- **Producción real:** no uses el seeder demo; crea las razas y un admin con contraseña propia.

## 6. Verificación final
- `https://TU-BACKEND.onrender.com/health` → respuesta correcta.
- Abrir el frontend por HTTPS, recargar `/login` (no debe dar 404).
- Iniciar sesión y revisar en la consola del navegador (F12) que no haya errores de CORS.
- `https://TU-BACKEND.onrender.com/api/mascotas` sin token → debe dar 401 (la protección sigue activa).
- Revisa los Logs de Render sin errores.

## 7. Código QR
Con la URL del frontend ya verificada:
```
pip install "qrcode[pil]" segno opencv-python-headless
python scripts/generarQr.py https://TU-FRONTEND.onrender.com
```
Se crean `qr/qr-huellitas.png` y `qr/qr-huellitas.svg`. El script rechaza URLs que no sean HTTPS o que sean localhost, y lee el PNG de vuelta para confirmar la URL. Imprime el PNG (o el SVG, que no pierde calidad al agrandar) en tu cartel o diapositiva.

## Consejo para la feria
Los servicios gratuitos de Render se "duermen" por inactividad y la primera visita puede tardar casi un minuto. Abre la aplicación unos minutos antes de presentar.
