import { buildDatabaseUrl } from '../../../app/config/databaseUrl.js';

describe('config/databaseUrl', () => {
  it('en producción falla si no hay DATABASE_URL ni DB_PASSWORD', () => {
    expect(() => buildDatabaseUrl({ NODE_ENV: 'production' })).toThrow(/credenciales/);
  });

  it('en producción usa DATABASE_URL cuando existe', () => {
    const url = 'postgresql://u:p@host:5432/db?sslmode=require';
    expect(buildDatabaseUrl({ NODE_ENV: 'production', DATABASE_URL: url })).toBe(url);
  });

  it('en producción construye la URL con las variables DB_* si hay contraseña', () => {
    const url = buildDatabaseUrl({ NODE_ENV: 'production', DB_HOST: 'db', DB_PASSWORD: 'x y', DB_USER: 'app', DB_NAME: 'hs' });
    expect(url).toContain('postgresql://app:x%20y@db:5432/hs');
  });

  it('en desarrollo conserva valores por defecto locales', () => {
    expect(buildDatabaseUrl({ NODE_ENV: 'development' })).toContain('@localhost:5432/proyectohs');
  });
});
