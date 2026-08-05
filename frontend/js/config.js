/* Configuración del frontend para llamadas al backend.
 * Por defecto API_BASE queda vacío (''), lo que hace que las
 * llamadas fetch('/api/...') vayan al mismo origen donde se sirve
 * el frontend. Si el backend corre en otro host/puerto (por ejemplo
 * http://127.0.0.1:8000), establecer API_BASE = 'http://127.0.0.1:8000'
 * Ejemplo: window.API_BASE = 'http://127.0.0.1:8000';
 */

window.API_BASE = ""; // valor por defecto: mismo origen

// Helper útil: devuelve la URL completa para un endpoint relativo
window.apiUrl = function(path){
  // evita doble barra si API_BASE termina en / y path empieza en /
  const base = (window.API_BASE || '').replace(/\/+$/,'');
  return base + path;
};