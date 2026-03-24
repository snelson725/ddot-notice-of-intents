
const CLIENT_ID = '2yXDpCVxR7lvhfgs';

function login() {
  const redirectUri = "https://snelson725.github.io/ddot-notice-of-intents/auth/callback";

  const url = new URL("https://www.arcgis.com/sharing/rest/oauth2/authorize");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "token");
  url.searchParams.set("redirect_uri", redirectUri);

  window.location = url.toString();
}

const rows = data.features.map(f => f.properties);

function renderTable(rows) {
  if (!rows.length) return;

  const table = document.createElement("table");
  table.border = "1";

  // Create header row
  const header = document.createElement("tr");
  Object.keys(rows[0]).forEach(key => {
    const th = document.createElement("th");
    th.textContent = key;
    header.appendChild(th);
  });
  table.appendChild(header);

  // Create data rows
  rows.forEach(row => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(value => {
      const td = document.createElement("td");
      td.textContent = value === null ? "" : value;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  // Insert into page
  const output = document.getElementById("output");
  output.innerHTML = ""; // clear previous
  output.appendChild(table);
}

async function loadLayer() {
  const token = localStorage.getItem("arcgis_token");

  if (!token) {
    document.getElementById("output").textContent = "You must log in first.";
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

  const rows = data.features.map(f => f.properties);
  renderTable(rows);
}

