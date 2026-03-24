
const CLIENT_ID = '2yXDpCVxR7lvhfgs';

// Redirect user to ArcGIS Online login
function login() {
  const redirectUri = "https://snelson725.github.io/ddot-notice-of-intents/auth/callback";

  const url = new URL("https://www.arcgis.com/sharing/rest/oauth2/authorize");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "token"); // implicit flow
  url.searchParams.set("redirect_uri", redirectUri);

  window.location = url.toString();
}

// -----------------------------
// Load Secured Feature Layer
// -----------------------------
async function loadLayer() {
  const token = localStorage.getItem("arcgis_token");

  if (!token) {
    document.getElementById("output").textContent = "You must log in first.";
    return;
  }

  const url =
    "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_6e61d43c7a9f494486a828d920c0e3da_results/FeatureServer/0/query";

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

// -----------------------------
// Render Table
// -----------------------------
function renderTable(rows) {
  if (!rows.length) {
    document.getElementById("output").textContent = "No data returned.";
    return;
  }

  const table = document.createElement("table");
  table.border = "1";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "20px";

  // Header row
  const header = document.createElement("tr");
  Object.keys(rows[0]).forEach(key => {
    const th = document.createElement("th");
    th.textContent = key;
    th.style.padding = "6px";
    th.style.background = "#eee";
    header.appendChild(th);
  });
  table.appendChild(header);

  // Data rows
  rows.forEach(row => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(value => {
      const td = document.createElement("td");
      td.textContent = value === null ? "" : value;
      td.style.padding = "6px";
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  // Insert into page
  const output = document.getElementById("output");
  output.innerHTML = "";
  output.appendChild(table);
}