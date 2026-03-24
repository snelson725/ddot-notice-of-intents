console.log("main.js loaded");

// -----------------------------
// API Calls
// -----------------------------

async function loadSummary() {
  const res = await fetch("http://localhost:3000/api/summary");
  return res.json();
}

async function loadCommentsForNOI(noiId) {
  const res = await fetch(`http://localhost:3000/api/comments/${noiId}`);
  return res.json();
}

// -----------------------------
// Render Summary Table
// -----------------------------

function renderNOISummary(summary) {
  console.log("Rendering summary table");

  if (window.summaryTable) {
    window.summaryTable.destroy();
  }

  window.summaryTable = new Tabulator("#summary-table", {
    data: summary,
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 20,
    initialSort: [{ column: "comment_count", dir: "desc" }],
    columns: [
      { title: "NOI ID", field: "noi_id", headerFilter: "input" },
      { title: "DDOT Contact", field: "ddot_contact", headerFilter: "input" },
      { title: "Title", field: "noititle", headerFilter: "input" },
      { title: "Closing Date", field: "closing_date" },
      { title: "Comments", field: "comment_count", sorter: "number" }
    ],

    rowClick: async function (e, row) {
      console.log("Row clicked:", row.getData());
      const noiId = row.getData().noi_id;

      const comments = await loadCommentsForNOI(noiId);
      renderDetailTable(noiId, comments);
    }
  });
}

// -----------------------------
// Render Detail Table
// -----------------------------

function renderDetailTable(noiId, comments) {
  console.log("Rendering detail table for", noiId);

  document.getElementById("detail-title").textContent =
    `Comments for NOI: ${noiId}`;
  document.getElementById("detail-title").style.display = "block";

  if (window.detailTable) {
    window.detailTable.destroy();
  }

  window.detailTable = new Tabulator("#detail-table", {
    data: comments,
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

// -----------------------------
// Helpers
// -----------------------------

function formatDate(cell) {
  const value = cell.getValue();
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

// -----------------------------
// Initialize
// -----------------------------

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("current-date").textContent =
    new Date().toLocaleDateString();

  const summary = await loadSummary();
  renderNOISummary(summary);
});
