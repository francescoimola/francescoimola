// ===================================
// Core JavaScript - Loads on all pages
// ===================================
// Universal features: orphan prevention + email copy

(function() {
  "use strict";

  // Unorphanize - Prevent text widows
  function unorphanize() {
    try {
      document.querySelectorAll("p, h1, h2, h3, li, .prevent-orphan").forEach((element) => {
        try {
          if (element.classList.contains("no-wrap")) return;

          // Skip if element contains only a single child with no surrounding text
          if (element.children.length === 1 &&
              element.textContent.trim() === element.children[0].textContent.trim()) {
            return;
          }

          const content = element.innerHTML;
          // Match last space + text/tags, avoiding spaces inside HTML tags
          // Pattern: space + (optional opening tags) + (text) + (optional closing tags) at end
          element.innerHTML = content.replace(/ ((?:<[^>]+>)*[^<>\s]+(?:<[^>]+>)*)$/, "&nbsp;$1");
        } catch (error) {}
      });
    } catch (error) {}
  }

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
    // Load modal functionality if modal exists
    if (document.getElementById('rebrand-modal')) {
      import('./app-modal.js').catch(err => {
        console.error('Failed to load modal module:', err);
      });
    }

    // Load signup form functionality if form exists
    if (document.getElementById('signup-form')) {
      import('./app-signup.js').catch(err => {
        console.error('Failed to load signup module:', err);
      });
    }

    // Load carousel functionality if carousel exists
    if (document.querySelector('.testimonial-carousel')) {
      import('./app-carousel.js').catch(err => {
        console.error('Failed to load carousel module:', err);
      });
    }
  }

  // Initialize core features on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      unorphanize();
      initEmailCopy();
      loadFeatures();
    });
  } else {
    unorphanize();
    initEmailCopy();
    loadFeatures();
  }
})();
