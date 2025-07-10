// === systemChart.js ===
function groupBySystemAndMaintenance(data) {
  const result = {};
  data.forEach((entry) => {
    const system = entry["SYSTEM"] || "SYSTEM";
    const type = (entry["TYPE OF MAINTENANCE"] || "").toLowerCase();
    if (!result[system]) {
      result[system] = { Preventive: 0, Corrective: 0, Modification: 0 };
    }
    if (type.includes("preventive")) result[system].Preventive++;
    else if (type.includes("corrective")) result[system].Corrective++;
    else if (type.includes("modification")) result[system].Modification++;
  });
  return result;
}

function renderGroupedChart(groupedData) {
  const selectedSystems = getSelectedValues("filter-system");
  const allData = Object.entries(groupedData)
    .filter(([system]) => selectedSystems.length === 0 || selectedSystems.includes(system))
    .map(([system, counts]) => ({
      system,
      ...counts,
      total: counts.Preventive + counts.Corrective + counts.Modification,
    }));

  const prioritySystems = [
    "Slag Removal System", "Fly Ash Handling System", "Limestone Handling System",
    "Combustion System", "Water Treatment System", "Coal Handling System",
    "Biomass Handling System", "Feedwater System", "Circulating Water System",
    "Closed Circulating Cooling Water System"
  ];

  const priority = [], others = [];
  allData.forEach(item => (prioritySystems.includes(item.system) ? priority : others).push(item));
  priority.sort((a, b) => b.Preventive - a.Preventive);
  others.sort((a, b) => b.Preventive - a.Preventive);

  const combined = [...priority, ...others].slice(0, 10);
  const systems = combined.map(i => i.system);
  const preventiveData = combined.map(i => i.Preventive);
  const correctiveData = combined.map(i => i.Corrective);
  const modificationData = combined.map(i => i.Modification);

  const ctx = document.getElementById("maintenanceChart").getContext("2d");
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: systems,
      datasets: [
  {
    label: "Preventive",
    data: preventiveData,
    backgroundColor: "#4caf50",      // Green fill
    borderColor: "#388e3c",          // Darker green border
    borderWidth: 1,
    borderRadius: 6
  },
  {
    label: "Corrective",
    data: correctiveData,
    backgroundColor: "#FF0000",      // Red fill
    borderColor: "#d32f2f",          // Darker red border
    borderWidth: 1,
    borderRadius: 6
  },
  {
    label: "Modification",
    data: modificationData,
    backgroundColor: "#2196f3",      // Blue fill
    borderColor: "#1976d2",          // Darker blue border
    borderWidth: 1,
    borderRadius: 6
  }
]


    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top", labels: { font: { size: 13, family: "monospace" }, padding: 10 } },
        title: { display: true, text: `History Records`, font: { size: 18, family: "Oswald" }, padding: { top: 10, bottom: 20 } },
        datalabels: {
          color: "#fff", anchor: "center", align: "center", font: { weight: "bold", size: 12, family: "monospace" },
          formatter: Math.round,
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: {  }, grid: { color: "#eee" } },
        x: { grid: { display: false } },
      },
    },
    plugins: [ChartDataLabels],
  });
}
