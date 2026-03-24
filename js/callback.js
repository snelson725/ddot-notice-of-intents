function handleCallback() {
  const hash = new URLSearchParams(window.location.hash.substring(1));
  const token = hash.get("access_token");

  if (token) {
    localStorage.setItem("arcgis_token", token);
    window.location = "/ddot-notice-of-intents/";
  }
}

handleCallback();
