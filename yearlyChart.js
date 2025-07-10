function groupByYearAndMaintenance(data) {
  const result = {};

  data.forEach((entry) => {
    const dateStr = entry["DATE STARTED"];
    const dateObj = new Date(dateStr);
    const type = (entry["TYPE OF MAINTENANCE"] || "").toLowerCase();

    if (isNaN(dateObj.getTime())) return; // Skip invalid dates

    const year = dateObj.getFullYear();

    if (!result[year]) {
      result[year] = { Preventive: 0, Corrective: 0, Modification: 0 };
    }

    if (type.includes("preventive")) result[year].Preventive++;
    else if (type.includes("corrective")) result[year].Corrective++;
    else if (type.includes("modification")) result[year].Modification++;
  });

  return result;
}

function renderYearlyTrendChart(filteredData) {
  const selectedYears = getSelectedValues("filter-year");
  const yearCounts = groupByYearAndMaintenance(filteredData);

  let years = Object.keys(yearCounts).sort();
  if (selectedYears.length > 0) {
    years = years.filter((y) => selectedYears.includes(y));
  }

  const preventive = years.map((y) => yearCounts[y]?.Preventive || 0);
  const corrective = years.map((y) => yearCounts[y]?.Corrective || 0);
  const modification = years.map((y) => yearCounts[y]?.Modification || 0);

  const ctx = document.getElementById("yearlyTrendChart").getContext("2d");
  if (yearlyChart) yearlyChart.destroy();

  yearlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: years,
      datasets: [
        {
          label: "Preventive",
          data: preventive,
          backgroundColor: "#81c784",
          borderColor: "#66bb6a",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Corrective",
          data: corrective,
          backgroundColor: "#64b5f6",
          borderColor: "#42a5f5",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Modification",
          data: modification,
          backgroundColor: "#ffb74d",
          borderColor: "#ffa726",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 13, family: "monospace" },
            padding: 10,
          },
        },
        title: {
          display: true,
          text:
            selectedYears.length > 0
              ? `Maintenance Trend for ${selectedYears.join(", ")}`
              : "Yearly Maintenance Trend",
          font: { size: 18, family: "Oswald" },
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          backgroundColor: "#333",
          bodyFont: { size: 13 },
          cornerRadius: 6,
          padding: 10,
        },
        datalabels: {
          color: "#fff", // light text inside bars
          anchor: "center",
          align: "center",
          font: {
            size: 13,
            family: "monospace",
            weight: "bold",
          },
          formatter: (value) => (value > 0 ? value : ""),
        },
      },
      scales: {
        x: {
          ticks: { font: { family: "monospace", size: 12 } },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { family: "monospace", size: 12 } },
          grid: { color: "#f0f0f0" },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}