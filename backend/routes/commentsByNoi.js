const express = require("express");
const router = express.Router();

const { getArcGISToken } = require("../services/arcgisAuth");
const { fetchLayer } = require("../services/arcgis");

const COMMENTS_URL =
  "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_6e61d43c7a9f494486a828d920c0e3da_results/FeatureServer/0/query";

// GET /api/comments/:noi_id
router.get("/:noi_id", async (req, res) => {
  try {
    const noiId = req.params.noi_id;
    const token = await getArcGISToken();

    // Fetch all comments
    const comments = await fetchLayer(COMMENTS_URL, token);

    // Filter by NOI number
    const filtered = comments.filter(c => c.noi_id === noiId);

    res.json(filtered);
  } catch (err) {
    console.error("Error loading comments for NOI:", err);
    res.status(500).json({ error: "Failed to load comments for this NOI" });
  }
});

module.exports = router;
