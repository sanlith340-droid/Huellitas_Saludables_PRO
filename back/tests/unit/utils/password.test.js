'use strict';

const {
  hashContrasena,
  verificarContrasena,
  esHashScrypt,
} = require('../../../app/utils/password');

describe('utils/password', () => {
  describe('hashContrasena', () => {
    it('genera un hash scrypt verificable y compatible con VARCHAR(255)', async () => {
      const hash = await hashContrasena('claveDePrueba123');

      expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
      expect(hash.length).toBeLessThanOrEqual(255);
      expect(esHashScrypt(hash)).toBe(true);
      await expect(verificarContrasena('claveDePrueba123', hash)).resolves.toBe(true);
    });

    it('genera salts distintos para la misma contraseña', async () => {
      const primerHash = await hashContrasena('claveDePrueba123');
      const segundoHash = await hashContrasena('claveDePrueba123');

      expect(primerHash).not.toBe(segundoHash);
      await expect(verificarContrasena('claveDePrueba123', primerHash)).resolves.toBe(true);
      await expect(verificarContrasena('claveDePrueba123', segundoHash)).resolves.toBe(true);
    });

    it('rechaza contraseñas vacías o superiores a 1024 bytes', async () => {
      await expect(hashContrasena('')).rejects.toThrow(TypeError);
      await expect(hashContrasena('a'.repeat(1025))).rejects.toThrow(TypeError);
    });
  });

  describe('verificarContrasena', () => {
    it('rechaza una contraseña incorrecta', async () => {
      const hash = await hashContrasena('claveDePrueba123');

      await expect(verificarContrasena('otraClave', hash)).resolves.toBe(false);
    });

    it('rechaza formatos inválidos sin lanzar', async () => {
      await expect(verificarContrasena('x', '')).resolves.toBe(false);
      await expect(verificarContrasena('x', null)).resolves.toBe(false);
      await expect(verificarContrasena('x', 'scrypt$16384$8$1$abc$def')).resolves.toBe(false);
      await expect(verificarContrasena('x', 'texto$no$scrypt')).resolves.toBe(false);
    });

    it('rechaza parámetros de derivación no soportados', async () => {
      const salt = 'A'.repeat(24);
      const hash = 'A'.repeat(88);
      const valor = `scrypt$999999$8$1$${salt}$${hash}`;

      await expect(verificarContrasena('x', valor)).resolves.toBe(false);
      expect(esHashScrypt(valor)).toBe(false);
    });

    it('mantiene compatibilidad temporal con contraseñas antiguas en texto plano', async () => {
      await expect(verificarContrasena('antigua', 'antigua')).resolves.toBe(true);
      await expect(verificarContrasena('incorrecta', 'antigua')).resolves.toBe(false);
    });
  });

  describe('esHashScrypt', () => {
    it('distingue hashes válidos de valores no válidos', async () => {
      const hash = await hashContrasena('claveDePrueba123');

      expect(esHashScrypt(hash)).toBe(true);
      expect(esHashScrypt('texto plano')).toBe(false);
      expect(esHashScrypt('')).toBe(false);
      expect(esHashScrypt(null)).toBe(false);
      expect(esHashScrypt(undefined)).toBe(false);
    });
  });
});
