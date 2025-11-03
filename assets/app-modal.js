// ===================================
// Rebrand Modal Module
// ===================================
// Loaded only when #rebrand-modal element exists

(function() {
  "use strict";

  // Close modal function
  function closeModal() {
    const modal = document.getElementById('rebrand-modal');
    if (modal) {
      modal.style.display = 'none';
      localStorage.setItem('hasSeenRebrandModal', 'true');
    }
  }

  // Initialize modal display logic
  function initRebrandModal() {
    const modal = document.getElementById('rebrand-modal');
    if (!modal) return;

    const hasSeenModal = localStorage.getItem('hasSeenRebrandModal');
    if (!hasSeenModal) {
      setTimeout(function () {
        modal.style.display = 'flex';
      }, 500);
    }
  }

  // Make closeModal globally available for onclick attributes
  window.closeModal = closeModal;

  // Initialize on load event (after images/assets loaded)
  if (document.readyState === 'complete') {
    initRebrandModal();
  } else {
    window.addEventListener('load', initRebrandModal);
  }
})();
