
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

// Load tables
async function loadCommentTable() {
  return fetch("http://localhost:3000/api/comments").then(r => r.json());
}

async function loadAllNOIs() {
  return fetch("http://localhost:3000/api/nois").then(r => r.json());
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
