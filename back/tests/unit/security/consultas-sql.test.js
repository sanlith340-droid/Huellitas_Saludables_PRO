// tests/unit/security/consultas-sql.test.js
// Revisión automática del código: todas las consultas SQL crudas deben ser
// plantillas etiquetadas parametrizadas, nunca concatenadas ni "Unsafe".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '../../../app/generated/prisma/client.ts';

const APP = fileURLToPath(new URL('../../../app/', import.meta.url));

function archivosJs(directorio) {
  return fs.readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return entrada.name === 'generated' ? [] : archivosJs(ruta);
    return entrada.name.endsWith('.js') ? [ruta] : [];
  });
}

const ARCHIVOS = archivosJs(APP);

// Código sin comentarios: la documentación puede nombrar las APIs prohibidas.
function codigo(archivo) {
  return fs.readFileSync(archivo, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('seguridad - consultas SQL crudas', () => {
  it('revisa todos los archivos de app/ (excepto el cliente generado)', () => {
    expect(ARCHIVOS.length).toBeGreaterThan(20);
    expect(ARCHIVOS.some((archivo) => archivo.endsWith('disponibilidad.model.js'))).toBe(true);
  });

  it('no usa $queryRawUnsafe, $executeRawUnsafe ni Prisma.raw', () => {
    const prohibidos = /\$queryRawUnsafe|\$executeRawUnsafe|Prisma\.raw\s*\(/;
    const infractores = ARCHIVOS.filter((archivo) => prohibidos.test(codigo(archivo)));
    expect(infractores).toEqual([]);
  });

  it('usa $queryRaw/$executeRaw solo como plantilla etiquetada (no como función con texto)', () => {
    const llamadaComoFuncion = /\$(queryRaw|executeRaw)\s*\(/;
    const infractores = ARCHIVOS.filter((archivo) => llamadaComoFuncion.test(codigo(archivo)));
    expect(infractores).toEqual([]);
  });

  it('no construye SQL concatenando texto en llamadas .query() de pg', () => {
    const concatenado = /\.query\(\s*(`[^`]*\$\{|['"][^'"]*['"]\s*\+)/;
    const infractores = ARCHIVOS.filter((archivo) => concatenado.test(codigo(archivo)));
    expect(infractores).toEqual([]);
  });

  it('la plantilla de Prisma envía la entrada maliciosa como parámetro, no como SQL', () => {
    const ataque = "' OR 1=1 --";
    const consulta = Prisma.sql`SELECT id_usuario FROM usuario WHERE correo = ${ataque}`;

    expect(consulta.sql).toBe('SELECT id_usuario FROM usuario WHERE correo = ?');
    expect(consulta.sql).not.toContain('OR 1=1');
    expect(consulta.values).toEqual([ataque]);
  });
});
