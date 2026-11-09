import { vi } from 'vitest';

vi.mock('../../../app/utils/password.js', () => ({
  esHashScrypt: vi.fn(),
}));

import { Usuario } from '../../../app/models/index.js';
import { esHashScrypt } from '../../../app/utils/password.js';
import authModel from '../../../app/models/auth.model.js';

const HASH = `scrypt$16384$8$1$${'A'.repeat(24)}$${'B'.repeat(88)}`;

describe('models/auth.model - guardas de contraseña', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Usuario, 'create').mockResolvedValue({ get: () => ({}) });
    vi.spyOn(Usuario, 'findByPk').mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    expect(Usuario.create).not.toHaveBeenCalled();
  });

  it('permite crear un usuario con un hash scrypt válido y no lo devuelve', async () => {
    esHashScrypt.mockReturnValue(true);
    Usuario.create.mockResolvedValue({
      get: () => ({ id_usuario: 'USU998', contrasena: HASH }),
    });

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

    expect(Usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({ contrasena: HASH })
    );
    expect(resultado).not.toHaveProperty('contrasena');
  });

  it('rechaza actualizar la contraseña con un valor arbitrario', async () => {
    esHashScrypt.mockReturnValue(false);

    await expect(
      authModel.updatePassword('USU999', 'texto plano')
    ).rejects.toThrow(TypeError);

    expect(Usuario.findByPk).not.toHaveBeenCalled();
  });

  it('acepta actualizar la contraseña con un hash scrypt válido', async () => {
    const guardar = vi.fn();
    Usuario.findByPk.mockResolvedValue({
      id_usuario: 'USU999',
      contrasena: 'anterior',
      save: guardar,
    });
    esHashScrypt.mockReturnValue(true);

    const resultado = await authModel.updatePassword('USU999', HASH);

    expect(Usuario.findByPk).toHaveBeenCalledWith('USU999');
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({ id_usuario: 'USU999' });
  });
});
