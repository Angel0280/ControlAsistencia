/* ============================================================
   CONFIG.JS
   Configuraciones globales del entorno
   ============================================================ */

// 1. Define la URL base de tu backend (FastAPI)
// Cambia el puerto 8000 si tu servidor de Python usa uno diferente
const BASE_URL = 'http://localhost:8000'; 

/**
 * Construye y retorna la URL completa para el fetch.
 * Evita problemas de barras dobles (//) al concatenar.
 * 
 * @param {string} path - Ruta relativa (ej: '/api/empleados' o 'api/empleados')
 * @returns {string} - URL absoluta (ej: 'http://localhost:8000/api/empleados')
 */
export const apiUrl = (path) => {
    // Validar que el path no sea nulo o indefinido
    if (!path) return BASE_URL;

    // Aseguramos que el path siempre empiece con una barra "/"
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${BASE_URL}${cleanPath}`;
};