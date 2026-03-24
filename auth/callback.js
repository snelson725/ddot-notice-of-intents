function handleCallback() {
  const hash = new URLSearchParams(window.location.hash.substring(1));
  const token = hash.get("access_token");
  
  if (token) {
    localStorage.setItem("arcgis_token", token);

    // Redirect back to your GitHub Pages app
    window.location = "https://snelson725.github.io/ddot-notice-of-intents/";
  } else {
    document.body.textContent = "Authentication failed.";
  }
}

handleCallback();
