/* ============================================================
   UTILS.JS
   Funciones utilitarias compartidas por toda la aplicación.
   ============================================================ */

/**
 * Debounce: retrasa la ejecución de fn hasta que pasen `delay` ms
 * sin que se vuelva a llamar.
 * @param {Function} fn    - Función a ejecutar
 * @param {number}   delay - Milisegundos de espera
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Formatea un número como moneda en Córdobas (C$).
 * @param {number|string} value
 * @returns {string} Ej: "C$ 15,000.00"
 */
export function formatMoney(value) {
  const num = parseFloat(value) || 0;
  return `C$ ${num.toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formatea una fecha ISO a formato legible.
 * @param {string} isoDate - Ej: "2026-08-16"
 * @param {object} options - Opciones de toLocaleDateString
 * @returns {string}
 */
export function formatDate(isoDate, options = {}) {
  if (!isoDate) return '—';
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

/**
 * Formatea hora (HH:MM:SS o HH:MM) a formato legible.
 * @param {string} time - Ej: "08:30:00"
 * @returns {string}
 */
export function formatTime(time) {
  if (!time) return '—';
  return time.substring(0, 5); // "08:30"
}

/**
 * Escapa HTML para prevenir XSS al inyectar contenido dinámico.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Llena un <select> con opciones desde un array de objetos.
 * @param {string} selectId    - ID del elemento <select>
 * @param {Array}  items       - Array de objetos
 * @param {string} valueField  - Campo a usar como value
 * @param {string} textField   - Campo a mostrar como texto
 * @param {string} placeholder - Texto del option vacío (opcional)
 */
export function fillSelect(selectId, items, valueField, textField, placeholder = '') {
  const select = document.getElementById(selectId);
  if (!select) return;

  let html = '';
  if (placeholder) {
    html = `<option value="">${escapeHtml(placeholder)}</option>`;
  }

  html += items
    .map(item => `<option value="${item[valueField]}">${escapeHtml(String(item[textField]))}</option>`)
    .join('');

  select.innerHTML = html;
}

/**
 * Obtiene la hora actual formateada.
 * @returns {string} Ej: "15:30:45"
 */
export function getCurrentTime() {
  return new Date().toLocaleTimeString('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Obtiene la fecha actual formateada.
 * @returns {string} Ej: "lunes, 16 de agosto de 2026"
 */
export function getCurrentDate() {
  return new Date().toLocaleDateString('es-NI', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
