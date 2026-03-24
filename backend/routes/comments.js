const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // ensure v2 is installed
const { fetchLayer } = require("../services/arcgis");
const { getArcGISToken } = require("../services/arcgisAuth");

const COMMENTS_URL =
  "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_6e61d43c7a9f494486a828d920c0e3da_results/FeatureServer/0/query";

// -----------------------------
// Route: GET /api/comments
// -----------------------------
router.get("/", async (req, res) => {
  try {
    const token = await getArcGISToken();   // <-- now inside async function
    const rows = await fetchLayer(COMMENTS_URL, token);
    res.json(rows);
  } catch (err) {
    console.error("Error loading comments:", err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

module.exports = router;

