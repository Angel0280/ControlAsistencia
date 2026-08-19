/* ============================================================
   API.JS
   Servicio HTTP centralizado.
   Todas las llamadas al backend pasan por aquí.
   ============================================================ */

import { apiUrl } from './config.js';
import { toast } from './toast.js';

/**
 * Wrapper centralizado para fetch().
 * - Agrega headers JSON automáticamente.
 * - Parsea la respuesta como JSON.
 * - Lanza toast de error si la petición falla.
 *
 * @param {string} path     - Ruta relativa (ej: '/api/empleados')
 * @param {object} options  - Opciones de fetch (method, body, etc.)
 * @returns {Promise<any>}  - Datos parseados de la respuesta
 * @throws {Error}          - Si la respuesta no es ok
 */

const BASE_URL = 'http://localhost:8000';
async function request(path, options = {}) {
  const url = apiUrl(path);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Si hay body y es objeto, serializarlo
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Si la respuesta no es exitosa, intentar leer el detalle del error
    if (!response.ok) {
      let errorMsg = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch {
        // Si no se puede parsear el error, usar el status text
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    // Si no hay contenido (204), retornar null
    if (response.status === 204) {
      return null;
    }

    return await response.json();

  } catch (error) {
    // Si es error de red (sin conexión)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    }
    throw error;
  }
}

/**
 * Métodos HTTP del servicio API.
 * Uso:
 *   import { api } from './api.js';
 *   const empleados = await api.get('/api/empleados');
 *   await api.post('/api/empleados', { nombre: 'Juan' });
 */
export const api = {

  /** GET request */
  get(path) {
    return request(path, { method: 'GET' });
  },

  /** POST request con body JSON */
  post(path, body) {
    return request(path, { method: 'POST', body });
  },

  /** PUT request con body JSON */
  put(path, body) {
    return request(path, { method: 'PUT', body });
  },

  /** PATCH request con body JSON */
  patch(path, body) {
    return request(path, { method: 'PATCH', body });
  },

  /** DELETE request */
  delete(path) {
    return request(path, { method: 'DELETE' });
  },
};
