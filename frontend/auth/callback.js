function handleCallback() {
  const hash = new URLSearchParams(window.location.hash.substring(1));
  const token = hash.get("access_token");

  if (token) {
    // Success: store token and return to app
    localStorage.setItem("arcgis_token", token);
    window.location = "https://snelson725.github.io/ddot-notice-of-intents/";
    return;
  }

  // If we reach here, authentication failed
  document.body.innerHTML = `
    <h2>Authentication Failed</h2>
    <p>We couldn't log you in. This sometimes happens if the login window was closed or the session expired.</p>
    <button id="goHome">Return to Homepage</button>
  `;

  document.getElementById("goHome").onclick = () => {
    window.location = "https://snelson725.github.io/ddot-notice-of-intents/";
  };
}

handleCallback();
