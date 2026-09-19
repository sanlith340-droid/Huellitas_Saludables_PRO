// tests/unit/utils/jwt.test.js
// Prueba las funciones de JWT.
//
// Estas funciones son las que firman el token cuando un usuario
// hace login, y las que lo verifican en cada petición.

const { generarToken, verificarToken } = require('../../../app/utils/jwt');

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
});