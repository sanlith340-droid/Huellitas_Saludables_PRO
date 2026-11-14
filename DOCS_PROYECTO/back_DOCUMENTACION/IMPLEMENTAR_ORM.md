# Prisma ORM 7 en Huellitas Saludables

El backend utiliza Prisma ORM 7 en ESM. La definición de los siete modelos está en `back/prisma/schema.prisma`, la configuración CLI en `back/prisma.config.ts`, y el cliente generado se importa desde el singleton `back/app/config/prisma.js`.

## Instalar y aplicar el esquema

```bash
cd back
npm ci                 # incluye prisma generate
npx prisma validate
npm run migrate
```

`npm run migrate` crea el schema en una base vacía. Para una base ya existente, primero valida que tablas, columnas, restricciones, índice parcial y triggers coincidan con el baseline; si no coinciden, termina sin borrar ni modificar filas. Mantén una copia de seguridad antes de actualizar.

Para cargar los registros de demostración en desarrollo:

```bash
npm run seed
```

No uses los datos demo ni sus credenciales en producción. Más información: [guía de desarrollo](DESARROLLO.md) y [arquitectura](ARQUITECTURA.md).
