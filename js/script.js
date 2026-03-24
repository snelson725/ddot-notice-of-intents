async function main() {
  const raw = await fetchEsriData();
  const rows = stripGeometry(raw);

  const processed = rows
    .filter(r => r.population > 5000)
    .sort((a, b) => b.population - a.population);

  renderTable(processed);
}

main();
