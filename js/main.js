
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
async function loadCommentTable() {
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

  return data.features.map(f => f.properties);
  
}

// -----------------------------
// Load NOI Feature Layer
// -----------------------------
async function loadNOILayer(url, token) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    f: "geojson",
    token
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  return data.features.map(f => f.properties);
}

function normalizeNOI(noi) {
  return {
    noi_id: noi.noi_number,  // match comments table
    ddot_contact: noi.email_for_point_of_contact,
    noititle: noi.project_description || "",
    closing_date: noi.closing_date,
    raw: noi  // keep original in case you need more fields later
  };
}

async function loadAllNOIs() {
  const token = localStorage.getItem("arcgis_token");

  const pointURL = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_b0101fe6fa5d4be39fc2ff796c1c7d3b_results/FeatureServer/0/query";
  const lineURL = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_3f2a5c4cd6dd40f1a33d8473401825d2_results/FeatureServer/0/query";
  const polyURL = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_283281e5da8c4e688702f2168354358c_results/FeatureServer/0/query";

  const [points, lines, polys] = await Promise.all([
    loadNOILayer(pointURL, token),
    loadNOILayer(lineURL, token),
    loadNOILayer(polyURL, token)
  ]);

  // Normalize all three tables
  return [
    ...points.map(normalizeNOI),
    ...lines.map(normalizeNOI),
    ...polys.map(normalizeNOI)
  ];}

// -----------------------------
// Render Tables
// -----------------------------

function showDetailTable(noiId, commentRows) {
  const detailRows = commentRows.filter(r => r.noi_id === noiId);

  document.getElementById("detail-title").textContent =
    `Comments for NOI: ${noiId}`;
  document.getElementById("detail-title").style.display = "block";

  new Tabulator("#detail-table", {
    data: detailRows,
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 10,
    columns: [
      { title: "Creation Date", field: "CreationDate", formatter: formatDate },
      { title: "Your Name", field: "your_name" },
      { title: "Email", field: "email_address" },
      {
        title: "Comment",
        field: "comment_here",
        widthGrow: 3,
        formatter: cell => {
          const text = cell.getValue() || "";
          return text.length > 60 ? text.slice(0, 60) + "…" : text;
        }
      }
    ]
  });
}


// Format date
function formatDate(cell) {
  const value = cell.getValue();
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString();
}

function buildNOISummary(noiRows, commentRows) {
  const commentCount = {};

  commentRows.forEach(c => {
    const id = c.noi_id;
    if (!commentCount[id]) commentCount[id] = 0;
    commentCount[id] += 1;
  });

  return noiRows.map(noi => ({
    noi_id: noi.noi_id,
    ddot_contact: noi.ddot_contact,
    noititle: noi.noititle,
    comment_count: commentCount[noi.noi_id] || 0
  }));
}

function renderNOISummary(noiSummary, commentRows) {
  new Tabulator("#summary-table", {
    data: noiSummary,
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 20,
    initialSort: [{ column: "comment_count", dir: "desc" }],
    columns: [
      { title: "NOI ID", field: "noi_id", headerFilter: "input" },
      { title: "DDOT Contact", field: "ddot_contact", headerFilter: "input" },
      { title: "Title", field: "noititle", headerFilter: "input" },
      { title: "Comments", field: "comment_count", sorter: "number" }
    ],
    rowClick: function (e, row) {
      const noiId = row.getData().noi_id;
      showDetailTable(noiId, commentRows);
    }
  });
}

// On page load:
document.addEventListener("DOMContentLoaded", () => {
  const span = document.getElementById("current-date");
  if (span) {
    const today = new Date();
    span.textContent = today.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  const token = localStorage.getItem("arcgis_token");
  if (token) {
    init();
  }
});


async function init() {
  const noiRows = await loadAllNOIs();
  const commentRows = await loadCommentTable();

  const summary = buildNOISummary(noiRows, commentRows);

  renderNOISummary(summary, commentRows);
}
