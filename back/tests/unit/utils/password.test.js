// tests/unit/utils/password.test.js
// Hashing y verificación de contraseñas con bcrypt.
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import {
  hashContrasena,
  verificarContrasena,
  esHashBcrypt,
  esHashScrypt,
  necesitaRehash,
  clasificarContrasenaGuardada,
  simularVerificacion,
} from '../../../app/utils/password.js';

// Genera un hash scrypt con el formato de la versión anterior del proyecto.
function hashScryptHeredado(contrasena) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(contrasena, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', 16384, 8, 1, salt.toString('base64'), hash.toString('base64')].join('$');
}

describe('utils/password (bcrypt)', () => {
  describe('hashContrasena', () => {
    it('genera un hash bcrypt $2b$ con 12 rondas que cabe en VARCHAR(255)', async () => {
      const hash = await hashContrasena('claveDePrueba123');

      expect(hash).toMatch(/^\$2b\$12\$[./A-Za-z0-9]{53}$/);
      expect(bcrypt.getRounds(hash)).toBe(12);
      expect(hash.length).toBe(60);
      expect(esHashBcrypt(hash)).toBe(true);
      expect(hash).not.toContain('claveDePrueba123');
    });

    it('usa un salt distinto en cada hash de la misma contraseña', async () => {
      const primero = await hashContrasena('claveDePrueba123');
      const segundo = await hashContrasena('claveDePrueba123');

      expect(primero).not.toBe(segundo);
      expect(primero.slice(7, 29)).not.toBe(segundo.slice(7, 29)); // salt de 22 caracteres
      await expect(verificarContrasena('claveDePrueba123', primero)).resolves.toBe(true);
      await expect(verificarContrasena('claveDePrueba123', segundo)).resolves.toBe(true);
    });

    it('nunca usa menos de 10 rondas aunque BCRYPT_SALT_ROUNDS sea menor', async () => {
      const anterior = process.env.BCRYPT_SALT_ROUNDS;
      process.env.BCRYPT_SALT_ROUNDS = '4';
      try {
        const hash = await hashContrasena('claveDePrueba123');
        expect(bcrypt.getRounds(hash)).toBe(12);
      } finally {
        if (anterior === undefined) delete process.env.BCRYPT_SALT_ROUNDS;
        else process.env.BCRYPT_SALT_ROUNDS = anterior;
      }
    });

    it('rechaza contraseñas vacías y de más de 72 bytes (límite de bcrypt)', async () => {
      await expect(hashContrasena('')).rejects.toThrow(TypeError);
      await expect(hashContrasena('a'.repeat(73))).rejects.toThrow(/72 bytes/);
      await expect(hashContrasena('ñ'.repeat(37))).rejects.toThrow(/72 bytes/); // 74 bytes UTF-8
      await expect(hashContrasena('a'.repeat(72))).resolves.toMatch(/^\$2b\$12\$/);
    });

    it('rechaza espacios, tabulaciones, saltos de línea y espacios Unicode', async () => {
      const valoresConEspacios = ['clave con espacios', 'clave\tcon tab', 'clave\ncon salto', 'clave\u00a0unicode'];
      for (const valor of valoresConEspacios) {
        await expect(hashContrasena(valor)).rejects.toThrow(/La contraseña no puede contener espacios/);
      }
    });
  });

  describe('verificarContrasena (bcrypt.compare)', () => {
    it('acepta la contraseña correcta y rechaza una incorrecta', async () => {
      const hash = await hashContrasena('claveDePrueba123');

      await expect(verificarContrasena('claveDePrueba123', hash)).resolves.toBe(true);
      await expect(verificarContrasena('otraClave', hash)).resolves.toBe(false);
      await expect(verificarContrasena('claveDePrueba1234', hash)).resolves.toBe(false);
    });

    it('usa bcrypt.compare para validar hashes bcrypt', async () => {
      const hash = await hashContrasena('claveDePrueba123');
      const espia = vi.spyOn(bcrypt, 'compare');
      try {
        await verificarContrasena('claveDePrueba123', hash);
        expect(espia).toHaveBeenCalledWith('claveDePrueba123', hash);
      } finally {
        espia.mockRestore();
      }
    });

    it('NO acepta contraseñas almacenadas en texto plano', async () => {
      await expect(verificarContrasena('123456', '123456')).resolves.toBe(false);
      await expect(verificarContrasena('antigua', 'antigua')).resolves.toBe(false);
    });

    it('rechaza entradas de inyección como datos, sin lanzar', async () => {
      const hash = await hashContrasena('claveDePrueba123');
      for (const ataque of ["'OR'1'='1", "admin'--", "'OR1=1--"]) {
        await expect(verificarContrasena(ataque, hash)).resolves.toBe(false);
      }
    });

    it('rechaza formatos inválidos sin lanzar', async () => {
      await expect(verificarContrasena('x', '')).resolves.toBe(false);
      await expect(verificarContrasena('x', null)).resolves.toBe(false);
      await expect(verificarContrasena('x', '$2b$12$corto')).resolves.toBe(false);
      await expect(verificarContrasena('x', 'scrypt$16384$8$1$abc$def')).resolves.toBe(false);
      await expect(verificarContrasena('', '$2b$12$' + 'a'.repeat(53))).resolves.toBe(false);
    });

    it('rechaza contraseñas de más de 72 bytes contra un hash bcrypt (sin truncar)', async () => {
      const base = 'a'.repeat(72);
      const hash = await bcrypt.hash(base, 10);
      await expect(verificarContrasena(base, hash)).resolves.toBe(true);
      await expect(verificarContrasena(`${base}EXTRA`, hash)).resolves.toBe(false);
    });
  });

  describe('compatibilidad con hashes scrypt heredados', () => {
    it('verifica un hash scrypt de la versión anterior y lo marca para re-hash', async () => {
      const heredado = hashScryptHeredado('claveAntigua1');

      expect(esHashScrypt(heredado)).toBe(true);
      expect(clasificarContrasenaGuardada(heredado)).toBe('scrypt');
      await expect(verificarContrasena('claveAntigua1', heredado)).resolves.toBe(true);
      await expect(verificarContrasena('incorrecta', heredado)).resolves.toBe(false);
      expect(necesitaRehash(heredado)).toBe(true);
    });

    it('rechaza parámetros scrypt no soportados', async () => {
      const valor = `scrypt$999999$8$1$${'A'.repeat(24)}$${'A'.repeat(88)}`;
      await expect(verificarContrasena('x', valor)).resolves.toBe(false);
      expect(esHashScrypt(valor)).toBe(false);
    });
  });

  describe('necesitaRehash / clasificarContrasenaGuardada', () => {
    it('no re-hashea un bcrypt de 12 rondas y sí uno de 10', async () => {
      expect(necesitaRehash(await hashContrasena('claveDePrueba123'))).toBe(false);
      expect(necesitaRehash(await bcrypt.hash('claveDePrueba123', 10))).toBe(true);
    });

    it('clasifica bcrypt, scrypt, texto plano y vacío', async () => {
      expect(clasificarContrasenaGuardada(await hashContrasena('claveDePrueba123'))).toBe('bcrypt');
      expect(clasificarContrasenaGuardada(hashScryptHeredado('x1234'))).toBe('scrypt');
      expect(clasificarContrasenaGuardada('123456')).toBe('texto_plano');
      expect(clasificarContrasenaGuardada('')).toBe('vacio');
      expect(clasificarContrasenaGuardada(null)).toBe('vacio');
    });
  });

  it('simularVerificacion siempre devuelve false', async () => {
    await expect(simularVerificacion('cualquiera')).resolves.toBe(false);
    await expect(simularVerificacion(undefined)).resolves.toBe(false);
  });
});
