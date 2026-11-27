import { obtenerOrigenesCorsPermitidos } from '../../../app/config/corsOrigins.js';

describe('orígenes permitidos por CORS', () => {
  it('permite los puertos locales de Vite y Docker fuera de producción', () => {
    const permitidos = obtenerOrigenesCorsPermitidos({
      nodeEnv: 'development',
      corsOrigin: undefined,
    });

    expect(permitidos).toContain('http://localhost:5173');
    expect(permitidos).toContain('http://127.0.0.1:5173');
    expect(permitidos).toContain('http://localhost:8080');
    expect(permitidos).toContain('http://127.0.0.1:8080');
  });

  it('conserva orígenes locales además de los configurados en desarrollo', () => {
    const permitidos = obtenerOrigenesCorsPermitidos({
      nodeEnv: 'development',
      corsOrigin: 'https://panel.local, http://localhost:5173',
    });

    expect(permitidos).toContain('https://panel.local');
    expect(permitidos.filter((origen) => origen === 'http://localhost:5173')).toHaveLength(1);
  });

  it('en producción solo permite los orígenes configurados explícitamente', () => {
    expect(obtenerOrigenesCorsPermitidos({
      nodeEnv: 'production',
      corsOrigin: 'https://huellitas.example',
    })).toEqual(['https://huellitas.example']);

    expect(obtenerOrigenesCorsPermitidos({
      nodeEnv: 'production',
      corsOrigin: undefined,
    })).toEqual([]);
  });
});
