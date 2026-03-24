const fetch = require("node-fetch");

let cachedToken = null;
let tokenExpiresAt = 0; // timestamp in ms

async function getArcGISToken() {
  const now = Date.now();

  // If token exists and hasn't expired, reuse it
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  // Otherwise request a new token
  const response = await fetch("https://www.arcgis.com/sharing/rest/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.ARCGIS_CLIENT_ID,
      client_secret: process.env.ARCGIS_CLIENT_SECRET,
      grant_type: "client_credentials"
    })
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error("ArcGIS token error:", data);
    throw new Error("Failed to obtain ArcGIS token");
  }

  // Cache token + expiration
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000) - 60000; 
  // subtract 1 minute for safety

  console.log("🔐 New ArcGIS token fetched and cached");

  return cachedToken;
}

module.exports = { getArcGISToken };
