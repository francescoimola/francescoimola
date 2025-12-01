// ===================================
// Core JavaScript - Loads on all pages
// ===================================
// Universal features: orphan prevention + email copy

(function() {
  "use strict";

  // Copy email to clipboard with visual feedback
  function initEmailCopy() {
    const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');

    mailtoLinks.forEach(link => {
      link.addEventListener('click', async function(e) {
        e.preventDefault();

        const email = this.getAttribute('href').replace('mailto:', '');

        try {
          await navigator.clipboard.writeText(email);

          // Show success feedback
          const originalText = this.textContent;
          this.textContent = 'Email copied!';

          setTimeout(() => {
            this.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  }

  // Dynamic feature loading based on DOM elements
  function loadFeatures() {
    // Load carousel functionality if carousel exists
    if (document.querySelector('.testimonial-carousel')) {
      import('./app-carousel.js').catch(err => {
        console.error('Failed to load carousel module:', err);
      });
    }

    // Load tooltip functionality if tooltips exist
    if (document.querySelectorAll('[data-tooltip]').length) {
      import('./app-tooltips.js').catch(err => {
        console.error('Failed to load tooltip module:', err);
      });
    }
  }

  // Initialize core features on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initEmailCopy();
      loadFeatures();
    });
  } else {
    initEmailCopy();
    loadFeatures();
  }
})();
