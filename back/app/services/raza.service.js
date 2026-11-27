const ENDPOINTS = Object.freeze({
  perro: 'https://api.api-ninjas.com/v1/alldogs',
  gato: 'https://api.api-ninjas.com/v1/allcats',
});

const RAZAS_RESPALDO = Object.freeze({
  perro: [
    'Beagle',
    'Bulldog Francés',
    'Chihuahua',
    'Golden Retriever',
    'Husky Siberiano',
    'Labrador Retriever',
    'Pastor Alemán',
    'Poodle',
  ],
  gato: [
    'Angora',
    'Bengalí',
    'British Shorthair',
    'Maine Coon',
    'Persa',
    'Siamés',
  ],
});

const DURACION_CACHE_MS = 60 * 60 * 1000;
const TIEMPO_LIMITE_MS = 5000;
const cache = new Map();

function claveNormalizada(nombre) {
  return nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

function normalizarRazas(respuesta) {
  if (!Array.isArray(respuesta)) return [];
  const unicas = new Map();
  for (const elemento of respuesta) {
    const nombre = typeof elemento === 'string' ? elemento : elemento?.name;
    if (typeof nombre !== 'string') continue;
    const limpio = nombre.trim();
    if (!limpio || limpio.length > 200) continue;
    const clave = claveNormalizada(limpio);
    if (!unicas.has(clave)) unicas.set(clave, limpio);
  }
  return [...unicas.values()].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function resultadoRespaldo(especie, razon) {
  return {
    especie,
    razas: [...RAZAS_RESPALDO[especie]],
    origen: 'respaldo',
    ...(razon ? { motivo: razon } : {}),
  };
}

async function listarPorEspecie(especie) {
  const ahora = Date.now();
  const entrada = cache.get(especie);
  if (entrada && entrada.expira > ahora) return { ...entrada.resultado, razas: [...entrada.resultado.razas] };

  const apiKey = process.env.API_NINJAS_KEY?.trim();
  if (!apiKey) {
    const resultado = resultadoRespaldo(especie, 'clave_no_configurada');
    cache.set(especie, { resultado, expira: ahora + 5 * 60 * 1000 });
    return resultado;
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE_MS);
  try {
    const respuesta = await fetch(ENDPOINTS[especie], {
      headers: { 'X-Api-Key': apiKey },
      signal: controlador.signal,
    });
    if (!respuesta.ok) throw new Error(`API Ninjas respondió HTTP ${respuesta.status}`);
    const razas = normalizarRazas(await respuesta.json());
    if (razas.length === 0) throw new Error('API Ninjas devolvió un catálogo vacío o no válido');
    const resultado = { especie, razas, origen: 'api' };
    cache.set(especie, { resultado, expira: ahora + DURACION_CACHE_MS });
    return { ...resultado, razas: [...razas] };
  } catch {
    const resultado = resultadoRespaldo(especie, 'proveedor_no_disponible');
    cache.set(especie, { resultado, expira: Date.now() + 60 * 1000 });
    return resultado;
  } finally {
    clearTimeout(temporizador);
  }
}

function limpiarCache() {
  cache.clear();
}

export { ENDPOINTS, RAZAS_RESPALDO, listarPorEspecie, normalizarRazas, limpiarCache };
export default { listarPorEspecie };
