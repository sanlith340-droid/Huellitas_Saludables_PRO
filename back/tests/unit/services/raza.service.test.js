import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ENDPOINTS,
  listarPorEspecie,
  limpiarCache,
  normalizarRazas,
  RAZAS_RESPALDO,
} from '../../../app/services/raza.service.js';

describe('servicio de catálogo de razas', () => {
  beforeEach(() => {
    limpiarCache();
    vi.stubEnv('API_NINJAS_KEY', '');
  });

  afterEach(() => {
    limpiarCache();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('normaliza, elimina duplicados sin distinguir mayúsculas/acentos y ordena alfabéticamente', () => {
    expect(normalizarRazas([' siamés ', 'Beagle', 'SIAMES', '', null, { name: 'akita' }]))
      .toEqual(['akita', 'Beagle', 'siamés']);
  });

  it('usa el catálogo local de la especie cuando no hay clave', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const resultado = await listarPorEspecie('gato');
    expect(resultado).toMatchObject({ especie: 'gato', origen: 'respaldo', motivo: 'clave_no_configurada' });
    expect(resultado.razas).toEqual(RAZAS_RESPALDO.gato);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envía la clave solo en X-Api-Key y devuelve la lista normalizada', async () => {
    vi.stubEnv('API_NINJAS_KEY', 'secreto-de-prueba');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ['Siamese', 'Abyssinian', 'siamese', ' Persian '],
    });
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await listarPorEspecie('gato');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe(ENDPOINTS.gato);
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'X-Api-Key': 'secreto-de-prueba' });
    expect(resultado).toEqual({ especie: 'gato', razas: ['Abyssinian', 'Persian', 'Siamese'], origen: 'api' });
  });

  it('usa el respaldo cuando el proveedor responde con error', async () => {
    vi.stubEnv('API_NINJAS_KEY', 'clave-de-prueba');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const resultado = await listarPorEspecie('perro');
    expect(resultado).toMatchObject({ especie: 'perro', origen: 'respaldo', motivo: 'proveedor_no_disponible' });
    expect(resultado.razas).toEqual(RAZAS_RESPALDO.perro);
  });

  it('rechaza el catálogo vacío del proveedor y evita dejar la lista vacía', async () => {
    vi.stubEnv('API_NINJAS_KEY', 'clave-de-prueba');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    const resultado = await listarPorEspecie('gato');
    expect(resultado.origen).toBe('respaldo');
    expect(resultado.razas.length).toBeGreaterThan(0);
  });
});
