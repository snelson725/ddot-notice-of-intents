const fetch = require("node-fetch");

// Fetch a single ArcGIS FeatureServer layer using a token
async function fetchLayer(url, token) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    f: "geojson",
    token
  });

  const response = await fetch(`${url}?${params}`);

  if (!response.ok) {
    console.error("ArcGIS request failed:", response.status, await response.text());
    throw new Error("ArcGIS request failed");
  }

  const data = await response.json();

  if (!data.features) {
    console.error("ArcGIS returned no features:", data);
    return [];
  }

  return data.features.map(f => f.properties);
}

module.exports = { fetchLayer };
