/* ============================================================
   TOAST.JS
   Sistema de notificaciones tipo toast.
   ============================================================ */

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const DURATIONS = {
  success: 3000,
  error:   5000,
  warning: 4000,
  info:    3500,
};

/**
 * Muestra una notificación toast.
 * @param {string} message  - Texto del mensaje
 * @param {'success'|'error'|'warning'|'info'} type - Tipo de toast
 * @param {number} [duration] - Duración en ms (opcional, usa default por tipo)
 */
function show(message, type = 'info', duration) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const ms = duration || DURATIONS[type] || 3500;

  const toastEl = document.createElement('div');
  toastEl.className = `toast ${type}`;
  toastEl.innerHTML = `
    <span class="toast-icon">${ICONS[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Cerrar">✕</button>
  `;

  // Cerrar al hacer clic en ✕
  toastEl.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toastEl);
  });

  container.appendChild(toastEl);

  // Auto-remover después de la duración
  setTimeout(() => removeToast(toastEl), ms);
}

/**
 * Remueve un toast con animación de salida.
 * @param {HTMLElement} toastEl
 */
function removeToast(toastEl) {
  if (!toastEl || toastEl.classList.contains('removing')) return;

  toastEl.classList.add('removing');
  toastEl.addEventListener('animationend', () => {
    toastEl.remove();
  });
}

/**
 * API pública del sistema de toast.
 * Uso:
 *   import { toast } from './toast.js';
 *   toast.success('Empleado guardado');
 *   toast.error('No se pudo conectar');
 */
export const toast = {
  success: (msg, duration) => show(msg, 'success', duration),
  error:   (msg, duration) => show(msg, 'error', duration),
  warning: (msg, duration) => show(msg, 'warning', duration),
  info:    (msg, duration) => show(msg, 'info', duration),
};
