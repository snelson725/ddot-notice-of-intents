const express = require("express");
const router = express.Router();
const { fetchLayer } = require("../services/arcgis");
const { getArcGISToken } = require("../services/arcgisAuth");

const COMMENTS_URL =
  "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_6e61d43c7a9f494486a828d920c0e3da_results/FeatureServer/0/query";

// -----------------------------
// Route: GET /api/comments
// -----------------------------
router.get("/", async (req, res) => {
  try {
    const token = await getArcGISToken();
    const features = await fetchLayer(COMMENTS_URL, token);

    // Normalize the ArcGIS attributes into your API format
    const normalized = features.map(f => ({
      objectid: f.objectid,
      globalid: f.globalid,
      CreationDate: f.CreationDate,
      EditDate: f.EditDate,

      // 🔥 THIS is the field your summary API needs
      noi_id: f.noi_id,

      // (this is null in your data, but we keep it)
      noi_number: f.noi_number,

      submission_date: f.submission_date,
      response: f.response,
      response_date: f.response_date,
      your_name: f.your_name,
      email_address: f.email_address,
      your_home_address: f.your_home_address,
      noititle: f.noititle,
      ddot_contact: f.ddot_contact,
      comment_here: f.comment_here
    }));

    res.json(normalized);
  } catch (err) {
    console.error("Error loading comments:", err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

module.exports = router;
