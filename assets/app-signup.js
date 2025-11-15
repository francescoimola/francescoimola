// ===================================
// Newsletter Signup Form Module
// ===================================
// Loaded only when #signup-form element exists

(function () {
  "use strict";

  const submitButton = document.getElementById('submit-button');

  // Initialize signup form submission handler
  function initSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Disable button and show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Signing up...';
      }

      // Clear previous messages
      messageDiv.className = 'form-message';
      messageDiv.textContent = '';

      // Get form data
      const formData = new FormData(form);
      const email = formData.get('email');

      // Get Turnstile token
      const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value;

      if (!turnstileToken) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Please complete the security verification.';
        resetSubmitButton();
        return;
      }

      try {
        // Send to Netlify function (which verifies Turnstile then submits to Loops)
        const response = await fetch('/.netlify/functions/signup', {
          method: 'POST',
          body: JSON.stringify({ email, turnstileToken }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Parse JSON response
        const data = await response.json();

        if (response.ok && data.success) {
          // Success - show message and reset form
          messageDiv.className = 'form-message success';
          messageDiv.innerHTML = "<b>That's it, you're all signed up!</b> <br>Expect a welcome email soon. If you don't see it, please check your spam";
          form.reset();
          resetTurnstile();
        } else if (response.status === 429) {
          // Rate limit error
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Too many signups, please try again in a moment.';
          resetTurnstile();
        } else {
          // Error from server
          messageDiv.className = 'form-message error';
          messageDiv.textContent = data.message || 'Something went wrong. Please try again.';
          resetTurnstile();
        }
      } catch (error) {
        // Network error
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Unable to connect. Please check your connection and try again.';
        resetTurnstile();
      }
    });
  }

  // Reset Turnstile widget (also resets button via callback)
  function resetTurnstile() {
    if (window.turnstile) {
      window.turnstile.reset();
    } else {
      // Fallback if Turnstile isn't available
      resetSubmitButton();
    }
  }

  // Reset button to initial state
  function resetSubmitButton() {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Yes, keep me posted';
    }
  }

  // Global callback for Turnstile verification
  window.enableSubmit = function() {
    if (submitButton) {
      submitButton.disabled = false;
    }
  };

  // Initialize immediately since module is only loaded when form exists
  initSignupForm();
})();
