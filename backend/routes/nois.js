const express = require("express");
const router = express.Router();
const { fetchLayer } = require("../services/arcgis");
const { getArcGISToken } = require("../services/arcgisAuth");

const POINT_URL = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_b0101fe6fa5d4be39fc2ff796c1c7d3b_results/FeatureServer/0/query";
const LINE_URL = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_3f2a5c4cd6dd40f1a33d8473401825d2_results/FeatureServer/0/query";
const POLY_URL = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_283281e5da8c4e688702f2168354358c_results/FeatureServer/0/query";


function normalize(noi) {
  return {
    noi_id: noi.noi_number,
    ddot_contact: noi.email_for_point_of_contact,
    noititle: noi.project_description,
    closing_date: noi.closing_date
  };
}

router.get("/", async (req, res) => {
  try {
    const token = await getArcGISToken();
    console.log("Token:", token);

    const [points, lines, polys] = await Promise.all([
      fetchLayer(POINT_URL, token),
      fetchLayer(LINE_URL, token),
      fetchLayer(POLY_URL, token)
    ]);

    const all = [...points, ...lines, ...polys].map(normalize);

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed to load NOIs" });
  }
});

module.exports = router;
