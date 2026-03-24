const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Call your own APIs
    const [noisRes, commentsRes] = await Promise.all([
      fetch("http://localhost:3000/api/nois"),
      fetch("http://localhost:3000/api/comments")
    ]);

    const nois = await noisRes.json();
    const comments = await commentsRes.json();

    // Normalize helper
    const normalizeId = v =>
      String(v ?? "").trim().toLowerCase();

    // Count comments per NOI using noi_id
    const counts = {};
    comments.forEach(c => {
      const id = normalizeId(c.noi_id);
      if (!id) return;
      counts[id] = (counts[id] || 0) + 1;
    });

    // Build summary
    const summary = nois.map(noi => {
      const id = normalizeId(noi.noi_id);
      return {
        noi_id: noi.noi_id,
        ddot_contact: noi.ddot_contact,
        noititle: noi.noititle,
        closing_date: noi.closing_date,
        comment_count: counts[id] || 0
      };
    });

    res.json(summary);
  } catch (err) {
    console.error("Error building summary:", err);
    res.status(500).json({ error: "Failed to build summary" });
  }
});

module.exports = router;
