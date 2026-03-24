
const CLIENT_ID = '2yXDpCVxR7lvhfgs';

function login() {
  const redirectUri = "https://snelson725.github.io/ddot-notice-of-intents/auth/callback";

  const url = new URL("https://www.arcgis.com/sharing/rest/oauth2/authorize");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "token");
  url.searchParams.set("redirect_uri", redirectUri);

  window.location = url.toString();
}

async function loadLayer() {
  const token = localStorage.getItem("arcgis_token");

  if (!token) {
    console.log("No token found — user must log in");
    return;
  }

  const url = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_6e61d43c7a9f494486a828d920c0e3da_results/FeatureServer/0/query";

  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    f: "geojson",
    token
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  console.log("Layer data:", data);
}
