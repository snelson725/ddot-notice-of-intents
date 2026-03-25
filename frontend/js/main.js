console.log("Dashboard loaded");

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

    section.innerHTML = `<div class="bucket-title">${title}</div>`;

    const grid = document.createElement("div");
    grid.className = "noi-grid";

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

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  }
}

async function openDetail(noi) {
  const detail = document.getElementById("detail");
  const title = document.getElementById("detail-title");
  const commentsDiv = document.getElementById("comments");

  title.textContent = `${noi.noi_id} — ${noi.noititle}`;
  detail.classList.remove("hidden");

  const comments = await loadComments(noi.noi_id);

  commentsDiv.innerHTML = comments.map(c => `
    <div class="comment">
      <div><strong>${c.your_name}</strong> — ${c.email_address}</div>
      <div>${c.comment_here}</div>
      <div><em>${formatDate(c.CreationDate)}</em></div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const summary = await loadSummary();
  renderBuckets(summary);
});
