
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
const table = new Tabulator("#table", {
  data: rows,
  layout: "fitColumns",
  pagination: "local",
  paginationSize: 20,
  movableColumns: true,

  // Add this:
  rowFormatter: function(row) {
    const data = row.getData();

    // Create a hidden details element
    const holder = document.createElement("div");
    holder.style.display = "none";
    holder.style.padding = "10px";
    holder.style.background = "#fafafa";
    holder.style.borderTop = "1px solid #ddd";

    holder.innerHTML = `
      <strong>Full Comment:</strong><br>
      <div style="white-space: pre-wrap; margin-top: 6px;">
        ${data.comment_here || "No comment provided"}
      </div>
    `;

    row.getElement().appendChild(holder);

    // Store reference for toggling
    row._detailsHolder = holder;
  },

  // Add a click handler to toggle visibility
  rowClick: function(e, row) {
    const holder = row._detailsHolder;
    if (!holder) return;

    holder.style.display = holder.style.display === "none" ? "block" : "none";
  },

  columns: [
    { title: "NOI ID", field: "noi_id", headerFilter: "input" },
    { title: "Closing Date", field: "closing_date", sorter: "date", formatter: formatDate },
    { title: "DDOT Contact", field: "ddot_contact", headerFilter: "input" },
    { title: "Date of Comment", field: "CreationDate", sorter: "number", formatter: formatDate },
    { title: "Commenter Name", field: "your_name" },
    { title: "Email", field: "email_address" },

    // Comment column stays short
    {
      title: "Comment",
      field: "comment_here",
      formatter: function(cell) {
        const text = cell.getValue() || "";
        return text.length > 60 ? text.slice(0, 60) + "…" : text;
      }
    }
  ]
});

  // Add CSV download button
  document.getElementById("download").onclick = () => {
    table.download("csv", "ddot_noi_data.csv");
  };
}

// Format date
function formatDate(cell) {
  const value = cell.getValue();
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString();
}
