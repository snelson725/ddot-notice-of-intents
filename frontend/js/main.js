console.log("Dashboard loaded");

let fullSummary = [];

async function loadSummary() {
  const res = await fetch("http://localhost:3000/api/summary");
  return res.json();
}

async function loadComments(noiId) {
  const res = await fetch(`http://localhost:3000/api/comments/${noiId}`);
  return res.json();
}

// Color scale: 0 → blue, 50 → red
function commentColor(count) {
  const pct = Math.min(count / 50, 1);
  const r = Math.floor(59 + pct * (220 - 59));
  const g = Math.floor(130 - pct * 130);
  const b = Math.floor(246 - pct * 246);
  return `rgb(${r}, ${g}, ${b})`;
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(Number(ts)).toLocaleDateString();
}

function renderBuckets(summary) {
  const buckets = {
    "0 Comments": summary.filter(n => n.comment_count === 0),
    "1–20 Comments": summary.filter(n => n.comment_count >= 1 && n.comment_count <= 20),
    "20–50 Comments": summary.filter(n => n.comment_count > 20 && n.comment_count <= 50),
    "50+ Comments": summary.filter(n => n.comment_count > 50)
  };

  const container = document.getElementById("buckets");
  container.innerHTML = "";

  for (const [title, items] of Object.entries(buckets)) {
    const section = document.createElement("div");
    section.className = "bucket";

    // Header with count
    const header = document.createElement("div");
    header.className = "bucket-title";
    header.innerHTML = `
      <span>${title}</span>
      <span class="bucket-count">${items.length}</span>
    `;

    // Grid container
    const grid = document.createElement("div");
    grid.className = "noi-grid collapsed"; // start collapsed

    // Fill grid with NOI cards
    items.forEach(noi => {
      const card = document.createElement("div");
      card.className = "noi-card";

      if (noi.closing_date < Date.now()) {
        card.classList.add("closed");
      }

      card.innerHTML = `
        <div><strong>${noi.noi_id}</strong></div>
        <div>${noi.noititle}</div>
        <div>${noi.ddot_contact}</div>
        <div>Closes: ${formatDate(noi.closing_date)}</div>
        <div class="comment-count" style="color:${commentColor(noi.comment_count)}">
          ${noi.comment_count} comments
        </div>
      `;

      card.addEventListener("click", () => openDetail(noi));
      card.addEventListener("click", () => {
        console.log("Card clicked:", noi.noi_id);
        openDetail(noi);
      });
      grid.appendChild(card);
    });

    // Toggle behavior
    header.addEventListener("click", () => {
      const isCollapsed = grid.classList.contains("collapsed");
      grid.classList.toggle("collapsed", !isCollapsed);
      grid.classList.toggle("expanded", isCollapsed);
    });

    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
  }
}


async function openDetail(noi) {
  const detail = document.getElementById("detail");
  const title = document.getElementById("detail-title");
  const commentsDiv = document.getElementById("comments");
  const downloadBtn = document.getElementById("download-comments");

  title.textContent = `${noi.noi_id} — ${noi.noititle}`;
  detail.classList.remove("hidden");

  const comments = await loadComments(noi.noi_id);

  // Render comments
  commentsDiv.innerHTML = comments.map(c => `
    <div class="comment">
      <div><strong>${c.your_name}</strong> — ${c.email_address}</div>
      <div>${c.comment_here}</div>
      <div><em>${formatDate(c.CreationDate)}</em></div>
    </div>
  `).join("");

  // Enable CSV download
  downloadBtn.onclick = () => {
    downloadCSV(`${noi.noi_id}-comments.csv`, comments.map(c => ({
      ...c,
      noi_id: noi.noi_id
    })));
  };
}


function setupFilters() {
  const noiInput = document.getElementById("filter-noi");
  const emailInput = document.getElementById("filter-email");
  const statusSelect = document.getElementById("filter-status");

  const applyFilters = () => {
    const noiQuery = noiInput.value.toLowerCase();
    const emailQuery = emailInput.value.toLowerCase();
    const status = statusSelect.value;

    const filtered = fullSummary.filter(n => {
      const matchesNOI = n.noi_id.toLowerCase().includes(noiQuery);
      const matchesEmail = n.ddot_contact.toLowerCase().includes(emailQuery);

      const isClosed = n.closing_date < Date.now();
      const matchesStatus =
        status === "all" ||
        (status === "open" && !isClosed) ||
        (status === "closed" && isClosed);

      return matchesNOI && matchesEmail && matchesStatus;
    });

    renderBuckets(filtered);
  };

  noiInput.addEventListener("input", applyFilters);
  emailInput.addEventListener("input", applyFilters);
  statusSelect.addEventListener("change", applyFilters);
}

function downloadCSV(filename, rows) {
  const escape = (value) => {
    if (value == null) return "";
    return `"${String(value).replace(/"/g, '""')}"`;
  };

  const headers = ["NOI ID", "Name", "Email", "Comment", "Date"];
  const csvContent = [
    headers.join(","),
    ...rows.map(r =>
      [
        escape(r.noi_id),
        escape(r.your_name),
        escape(r.email_address),
        escape(r.comment_here),
        escape(formatDate(r.CreationDate))
      ].join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}




document.addEventListener("DOMContentLoaded", async () => {
  fullSummary = await loadSummary();
  renderBuckets(fullSummary);
  setupFilters();
});
