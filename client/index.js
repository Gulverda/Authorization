    function getTokenFromURL() {
      const params = new URLSearchParams(window.location.search);
      return params.get('token');
    }

    function getVerifiedStatus() {
      const params = new URLSearchParams(window.location.search);
      return params.get('verified');
    }

    async function verifyEmail() {
      const token = getTokenFromURL();
      const statusMessageDiv = document.getElementById('statusMessage');
      const verifyButton = document.getElementById('verifyButton');

      verifyButton.disabled = true;
      verifyButton.style.opacity = '0.7';
      verifyButton.style.cursor = 'not-allowed';

      if (!token) {
        statusMessageDiv.innerText = "Verification token is missing. Please ensure you clicked the complete link from your email.";
        statusMessageDiv.className = "status-message error";
        verifyButton.disabled = disabled;
        verifyButton.style.opacity = '1';
        verifyButton.style.cursor = 'pointer';
        return;
      }

      statusMessageDiv.innerText = "Verifying your email, please wait...";
      statusMessageDiv.className = "status-message info";

      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify?token=${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          let result;
          const contentType = response.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            result = { success: true, message: 'Email verified successfully!' };
          }

          if (result.success !== false) {
            statusMessageDiv.innerText = "✓ Your email has been successfully verified! Redirecting to your account...";
            statusMessageDiv.className = "status-message success";

            setTimeout(() => {
              window.location.href = '[YOUR_DASHBOARD_URL_AFTER_VERIFICATION]'; 
            }, 2000);
          } else {
            statusMessageDiv.innerText = "❌ " + (result.message || "Verification failed. The token may be expired or invalid.");
            statusMessageDiv.className = "status-message error";
            verifyButton.disabled = false; 
            verifyButton.style.opacity = '1';
            verifyButton.style.cursor = 'pointer';
          }
        } else {
          const errorResult = await response.json().catch(() => ({})); 
          statusMessageDiv.innerText = "❌ " + (errorResult.message || "Verification failed. Please try again or contact support.");
          statusMessageDiv.className = "status-message error";
          verifyButton.disabled = false; 
          verifyButton.style.opacity = '1';
          verifyButton.style.cursor = 'pointer';
        }

      } catch (error) {
        console.error('Verification error:', error);
        statusMessageDiv.innerText = "❌ A network error occurred. Please check your internet connection and try again.";
        statusMessageDiv.className = "status-message error";
        verifyButton.disabled = false; 
        verifyButton.style.opacity = '1';
        verifyButton.style.cursor = 'pointer';

        if (token) {
          setTimeout(() => {
            statusMessageDiv.innerHTML += `<br><br><strong>Alternative:</strong> Please contact support with your verification token: <br><code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 12px; word-break: break-all;">${token}</code>`;
          }, 1000);
        }
      }
    }

    window.onload = function() {
      const verified = getVerifiedStatus();
      const token = getTokenFromURL();
      const statusMessageDiv = document.getElementById('statusMessage');
      const verifyButton = document.getElementById('verifyButton');

      if (verified === 'true') {
        statusMessageDiv.innerText = "✓ Your email has been successfully verified! Redirecting to your account...";
        statusMessageDiv.className = "status-message success";
        verifyButton.style.display = 'none'; 
        setTimeout(() => {
          window.location.href = '[YOUR_DASHBOARD_URL_AFTER_VERIFICATION]'; 
        }, 2000);
      } else if (!token) {
        statusMessageDiv.innerText = "To verify your email, please click the 'Verify Email Address' button above.";
        statusMessageDiv.className = "status-message info";
      } else {
        statusMessageDiv.innerText = "Click the button below to verify your email address.";
        statusMessageDiv.className = "status-message info";
      }
    };



     document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value
      })
    });

    const data = await res.json();
    alert(data.message);
  });



    const token = new URLSearchParams(window.location.search).get('token');

  document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match');
    }

    const res = await fetch('http://localhost:5000/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await res.json();
    alert(data.message);
  });