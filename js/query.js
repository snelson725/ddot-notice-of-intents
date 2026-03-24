async function fetchEsriData() {
  const url = "https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/survey123_6e61d43c7a9f494486a828d920c0e3da_results/FeatureServer/0/query";
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    f: "geojson",
    token:
  });

  const response = await fetch(`${url}?${params}`);
  return response.json();
}

function stripGeometry(data) {
  return data.features.map(f => f.properties);
}
