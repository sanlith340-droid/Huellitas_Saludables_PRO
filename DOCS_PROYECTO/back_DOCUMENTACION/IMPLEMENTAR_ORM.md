# Prisma ORM 7 ESM en Huellitas Saludables

El backend usa Prisma ORM **7.10.1** como dependencia declarada/resuelta, en JavaScript ESM. `back/prisma/schema.prisma` declara 11 modelos; `back/prisma.config.ts` configura Prisma CLI; `back/app/config/prisma.js` crea el cliente con `@prisma/adapter-pg`. El esquema evoluciona mediante **seis migraciones** en `back/prisma/migrations/`; `0_init` es el baseline inicial, no el estado completo actual.

## Instalar y aplicar el esquema

```bash
cd back
npm ci                 # postinstall ejecuta prisma generate
npx prisma validate
npm run migrate
```

`npm run migrate` ejecuta el baseline condicional para bases existentes y luego `prisma migrate deploy`. Una base existente solo se registra contra el baseline si su estructura coincide; ante un esquema parcial o distinto el proceso aborta sin alterar filas. Conserva respaldo antes de actualizar. No modifiques migraciones aplicadas; crea una nueva migración para cambios.

Para cargar registros demo en desarrollo:

```bash
npm run seed
```

Las credenciales demo no se usan en producción. La tabla actual incluye modelos de recuperación de contraseña, revocación de tokens y notificaciones in-app, además de las entidades iniciales.

Guías relacionadas: [desarrollo](./DESARROLLO.md), [arquitectura](./ARQUITECTURA.md), [API y permisos](./API.md). La fuente del modelo sigue siendo `back/prisma/schema.prisma` y el SQL versionado completo reside en `back/prisma/migrations/`.
