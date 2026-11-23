// tests/unit/services/migracionContrasenas.service.test.js
// Migración de contraseñas en texto plano a bcrypt (cliente Prisma simulado).
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { migrarContrasenas, contarTextoPlano } from '../../../app/services/migracionContrasenas.service.js';

// Hash scrypt real con el formato de la versión anterior del proyecto.
const SCRYPT = (() => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync('claveVieja1', salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', 16384, 8, 1, salt.toString('base64'), hash.toString('base64')].join('$');
})();

function clienteSimulado(filas) {
  const datos = filas.map((fila) => ({ ...fila }));
  return {
    datos,
    usuario: {
      findMany: vi.fn(async ({ take, cursor }) => {
        const ordenadas = [...datos].sort((a, b) => a.id_usuario.localeCompare(b.id_usuario));
        const inicio = cursor ? ordenadas.findIndex((f) => f.id_usuario === cursor.id_usuario) + 1 : 0;
        return ordenadas.slice(inicio, inicio + take).map(({ id_usuario, contrasena }) => ({ id_usuario, contrasena }));
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        const fila = datos.find((f) => f.id_usuario === where.id_usuario && f.contrasena === where.contrasena);
        if (!fila) return { count: 0 };
        fila.contrasena = data.contrasena;
        return { count: 1 };
      }),
    },
  };
}

describe('services/migracionContrasenas', () => {
  let bcryptHash;
  beforeAll(async () => {
    bcryptHash = await bcrypt.hash('yaSegura1', 12);
  });

  it('en simulación solo cuenta y no modifica datos', async () => {
    const cliente = clienteSimulado([
      { id_usuario: 'USU001', contrasena: '123456' },
      { id_usuario: 'USU002', contrasena: bcryptHash },
      { id_usuario: 'USU003', contrasena: SCRYPT },
    ]);

    const resumen = await migrarContrasenas({ cliente });

    expect(resumen).toMatchObject({
      modo: 'simulacion', total: 3, bcrypt: 1, scrypt_pendiente_login: 1, texto_plano: 1, migradas: 0,
    });
    expect(cliente.usuario.updateMany).not.toHaveBeenCalled();
    expect(cliente.datos[0].contrasena).toBe('123456');
  });

  it('al aplicar guarda hashes bcrypt verificables y sin texto plano', async () => {
    const cliente = clienteSimulado([
      { id_usuario: 'USU001', contrasena: '123456' },
      { id_usuario: 'USU002', contrasena: 'otraClave9' },
      { id_usuario: 'USU003', contrasena: bcryptHash },
    ]);

    const resumen = await migrarContrasenas({ aplicar: true, cliente });

    expect(resumen.migradas).toBe(2);
    expect(cliente.datos[0].contrasena).toMatch(/^\$2b\$12\$/);
    expect(await bcrypt.compare('123456', cliente.datos[0].contrasena)).toBe(true);
    expect(await bcrypt.compare('otraClave9', cliente.datos[1].contrasena)).toBe(true);
    expect(cliente.datos[2].contrasena).toBe(bcryptHash);
    expect(JSON.stringify(resumen)).not.toMatch(/123456|otraClave9|\$2b\$/);
    await expect(contarTextoPlano(cliente)).resolves.toBe(0);
  });

  it('no migra valores que bcrypt no puede proteger y los reporta para restablecer', async () => {
    const cliente = clienteSimulado([
      { id_usuario: 'USU001', contrasena: 'a'.repeat(80) },
      { id_usuario: 'USU002', contrasena: 'con espacio' },
      { id_usuario: 'USU003', contrasena: '' },
    ]);

    const resumen = await migrarContrasenas({ aplicar: true, cliente });

    expect(resumen.migradas).toBe(0);
    expect(resumen.requieren_restablecimiento).toEqual(['USU001', 'USU002', 'USU003']);
    expect(cliente.usuario.updateMany).not.toHaveBeenCalled();
  });

  it('no pisa una contraseña que cambió durante la migración', async () => {
    const cliente = clienteSimulado([{ id_usuario: 'USU001', contrasena: '123456' }]);
    cliente.usuario.updateMany.mockResolvedValueOnce({ count: 0 });

    const resumen = await migrarContrasenas({ aplicar: true, cliente });

    expect(resumen.migradas).toBe(0);
    expect(resumen.omitidas_por_cambio_concurrente).toBe(1);
    expect(cliente.usuario.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_usuario: 'USU001', contrasena: '123456' },
    }));
  });
});
