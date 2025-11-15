// Netlify serverless function for newsletter signup with Turnstile verification

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { email, turnstileToken } = JSON.parse(event.body);

    // Validate inputs
    if (!email || !turnstileToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Email and Turnstile token are required'
        })
      };
    }

    // Step 1: Verify Turnstile token with Cloudflare
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileSecret) {
      console.error('TURNSTILE_SECRET_KEY environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Server configuration error'
        })
      };
    }

    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      }
    );

    const turnstileData = await turnstileResponse.json();

    // If Turnstile verification fails, return error
    if (!turnstileData.success) {
      console.error('Turnstile verification failed:', turnstileData);
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Security verification failed. Please try again.'
        })
      };
    }

    // Step 2: Submit to Loops.so (only if Turnstile verification passed)
    const loopsResponse = await fetch(
      'https://app.loops.so/api/newsletter-form/cmhepd87qfls01b0i7veoodr3',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&mailingLists=${encodeURIComponent('cmhf2vsgg03tb0iy66moa7r2h')}`,
      }
    );

    const loopsData = await loopsResponse.json();

    // Return Loops.so response
    if (loopsResponse.ok && loopsData.success) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "That's it, you're all signed up!"
        })
      };
    } else if (loopsResponse.status === 429) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          success: false,
          message: 'Too many signups, please try again in a moment.'
        })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: loopsData.message || 'Something went wrong. Please try again.'
        })
      };
    }

  } catch (error) {
    console.error('Error processing signup:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Unable to connect. Please check your connection and try again.'
      })
    };
  }
};