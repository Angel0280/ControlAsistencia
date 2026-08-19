/* ============================================================
   COMPONENTS / MODAL.JS
   Controlador genérico para abrir/cerrar modales.
   ============================================================ */

/**
 * Abre un modal por su ID.
 * @param {string} modalId - ID del elemento .modal-overlay
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('open');

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal(modalId);
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Cerrar al hacer clic en el overlay (fuera del modal-box)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modalId);
    }
  }, { once: true });
}

/**
 * Cierra un modal por su ID.
 * @param {string} modalId - ID del elemento .modal-overlay
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('open');
}

/**
 * Inicializa los event listeners globales para botones que cierran modales.
 * Busca elementos con atributo data-close-modal="modalId".
 * Se llama desde el render de cada vista que tiene modales.
 * @param {HTMLElement} container - Contenedor donde buscar los botones
 */
export function initModalCloseButtons(container) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-close-modal]');
    if (btn) {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    }
  });
}
