// tests/unit/utils/jwt.test.js
// Prueba las funciones de JWT.
//
// Estas funciones son las que firman el token cuando un usuario
// hace login, y las que lo verifican en cada petición.

import jwt from 'jsonwebtoken';
import { generarToken, verificarToken, JWT_SECRET } from '../../../app/utils/jwt.js';

describe('utils/jwt', () => {
  // Datos de prueba: un usuario ficticio
  const usuario = { id_usuario: 'USU001', rol: 'usuario' };

  // TEST POSITIVO: el token tiene 3 partes separadas por puntos
  it('generarToken devuelve un JWT (3 segmentos)', () => {
    const token = generarToken(usuario);
    // Un JWT siempre tiene este formato: xxx.yyy.zzz
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  // TEST POSITIVO: verificar devuelve los datos correctos
  it('verificarToken devuelve el payload correcto', () => {
    const token = generarToken(usuario);
    const payload = verificarToken(token);

    expect(payload.id).toBe('USU001');
    expect(payload.rol).toBe('usuario');
    expect(payload).toHaveProperty('iat');   // iat = "issued at" (cuándo se creó)
    expect(payload).toHaveProperty('exp');   // exp = "expires" (cuándo expira)
  });

  // TEST NEGATIVO: token inválido
  it('verificarToken con token inválido lanza error', () => {
    expect(() => verificarToken('no.es.un.jwt')).toThrow();
  });

  // TEST NEGATIVO: token alterado
  it('verificarToken con firma alterada lanza error', () => {
    const token = generarToken(usuario);
    // Cambiamos los últimos 3 caracteres de la firma
    const alterado = token.slice(0, -3) + 'abc';

    expect(() => verificarToken(alterado)).toThrow();
  });

  // ============================================================
  // JTI (identificador único para poder revocar un token concreto)
  // ============================================================
  describe('jti', () => {
    const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    it('generarToken incluye un jti UUID v4', () => {
      const payload = verificarToken(generarToken(usuario));
      expect(payload.jti).toMatch(UUID_V4);
    });

    it('dos tokens del mismo usuario emitidos en el mismo instante tienen jti distinto', () => {
      const a = verificarToken(generarToken(usuario));
      const b = verificarToken(generarToken(usuario));
      expect(a.jti).not.toBe(b.jti);
    });

    it('el payload solo contiene id, rol, jti, iat y exp (sin datos sensibles)', () => {
      const payload = verificarToken(generarToken({ ...usuario, contrasena: 'secreta', correo: 'a@b.co' }));
      expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'id', 'jti', 'rol']);
    });

    it('verificarToken rechaza un token expirado', () => {
      const expirado = jwt.sign({ id: 'USU001', rol: 'usuario' }, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: -10,
        jwtid: 'jti-expirado',
      });
      expect(() => verificarToken(expirado)).toThrow(/expired/i);
    });

    it('verificarToken rechaza un token firmado con otro secreto', () => {
      const ajeno = jwt.sign({ id: 'USU001', rol: 'usuario' }, 'otro-secreto-distinto', {
        algorithm: 'HS256',
        expiresIn: '1h',
        jwtid: 'jti-ajeno',
      });
      expect(() => verificarToken(ajeno)).toThrow();
    });

    it('verificarToken rechaza el algoritmo "none"', () => {
      const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
      const sinFirma = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 'USU001', rol: 'admin', jti: 'x' })}.`;
      expect(() => verificarToken(sinFirma)).toThrow();
    });
  });
});
