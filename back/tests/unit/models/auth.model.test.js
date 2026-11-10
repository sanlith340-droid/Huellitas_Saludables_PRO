import { vi } from 'vitest';

const { usuarioPrisma } = vi.hoisted(() => ({
  usuarioPrisma: {
    create: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock('../../../app/config/prisma.js', () => ({
  prisma: { usuario: usuarioPrisma },
}));

vi.mock('../../../app/utils/password.js', () => ({
  esHashScrypt: vi.fn(),
}));

import { esHashScrypt } from '../../../app/utils/password.js';
import authModel from '../../../app/models/auth.model.js';

const HASH = `scrypt$16384$8$1$${'A'.repeat(24)}$${'B'.repeat(88)}`;

describe('models/auth.model - guardas de contraseña con Prisma', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rechaza crear un usuario con un valor que no sea hash scrypt', async () => {
    esHashScrypt.mockReturnValue(false);

    await expect(
      authModel.create({
        id_usuario: 'USU999',
        nombre: 'Prueba',
        apellidos: 'Prueba',
        telefono: '3000000000',
        correo: 'prueba@example.com',
        direccion: 'Direccion',
        contrasena: 'texto plano',
        rol: 'usuario',
      })
    ).rejects.toThrow(TypeError);

    expect(usuarioPrisma.create).not.toHaveBeenCalled();
  });

  it('permite crear un usuario con hash scrypt y excluye la contraseña del retorno', async () => {
    esHashScrypt.mockReturnValue(true);
    usuarioPrisma.create.mockResolvedValue({ id_usuario: 'USU998', nombre: 'Prueba' });

    const resultado = await authModel.create({
      id_usuario: 'USU998',
      nombre: 'Prueba',
      apellidos: 'Prueba',
      telefono: '3000000000',
      correo: 'prueba2@example.com',
      direccion: 'Direccion',
      contrasena: HASH,
      rol: 'usuario',
    });

    expect(usuarioPrisma.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ contrasena: HASH }),
      select: expect.not.objectContaining({ contrasena: true }),
    }));
    expect(resultado).not.toHaveProperty('contrasena');
  });

  it('rechaza actualizar la contraseña con un valor arbitrario', async () => {
    esHashScrypt.mockReturnValue(false);

    await expect(authModel.updatePassword('USU999', 'texto plano')).rejects.toThrow(TypeError);
    expect(usuarioPrisma.updateMany).not.toHaveBeenCalled();
  });

  it('acepta actualizar la contraseña con un hash scrypt válido', async () => {
    esHashScrypt.mockReturnValue(true);
    usuarioPrisma.updateMany.mockResolvedValue({ count: 1 });

    const resultado = await authModel.updatePassword('USU999', HASH);

    expect(usuarioPrisma.updateMany).toHaveBeenCalledWith({
      where: { id_usuario: 'USU999' },
      data: { contrasena: HASH },
    });
    expect(resultado).toEqual({ id_usuario: 'USU999' });
  });
});
