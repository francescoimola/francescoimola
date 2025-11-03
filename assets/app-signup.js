// ===================================
// Newsletter Signup Form Module
// ===================================
// Loaded only when #signup-form element exists

(function() {
  "use strict";

  // Initialize signup form submission handler
  function initSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    const messageDiv = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Disable submit button and show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Signing up...';

      // Clear previous messages
      messageDiv.className = 'form-message';
      messageDiv.textContent = '';

      // Get form data
      const formData = new FormData(form);
      const email = formData.get('email');

      // Prepare the request body (URL-encoded)
      const formBody = `email=${encodeURIComponent(email)}&mailingLists=${encodeURIComponent('cmhf2vsgg03tb0iy66moa7r2h')}`;

      try {
        const response = await fetch('https://app.loops.so/api/newsletter-form/cmhepd87qfls01b0i7veoodr3', {
          method: 'POST',
          body: formBody,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },

        });

        // Parse JSON response
        const data = await response.json();

        if (response.ok && data.success) {
          // Success
          messageDiv.className = 'form-message success';
          messageDiv.innerHTML = "<b>That's it, you're all signed up!</b> <br>Expect a welcome email soon. If you don't see it, please check your spam";
          form.reset();
        } else if (response.status === 429) {
          // Rate limit error
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Too many signups, please try again in a moment.';
        } else {
          // Error from server
          messageDiv.className = 'form-message error';
          messageDiv.textContent = data.message || 'Something went wrong. Please try again.';
        }
      } catch (error) {
        // Network error
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Unable to connect. Please check your connection and try again.';
      } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Yes, keep me posted';
      }
    });
  }

  // Initialize immediately since module is only loaded when form exists
  initSignupForm();
})();
