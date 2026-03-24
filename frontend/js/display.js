function renderTable(rows) {
  const table = document.querySelector("#data-table tbody");
  table.innerHTML = rows.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.population}</td>
      <td>${r.county}</td>
    </tr>
  `).join("");
}