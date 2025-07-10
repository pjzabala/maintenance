// === problemChart.js ===
function groupProblemsBySystem(data) {
  const result = {};
  data.forEach((row) => {
    const system = row["SYSTEM"] || "Unknown System";
    const problem = row["TYPE OF PROBLEM/ACTIVITY"] || "Unspecified";
    if (!result[system]) result[system] = {};
    if (!result[system][problem]) result[system][problem] = 0;
    result[system][problem]++;
  });
  return result;
}

function renderProblemChart(groupedProblems, topSystem) {
  const ctx = document.getElementById("problemChart").getContext("2d");
  const problems = groupedProblems[topSystem] || {};
  const sorted = Object.entries(problems).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([problem]) => problem);
  const data = sorted.map(([_, count]) => count);
  if (problemChart) problemChart.destroy();

  problemChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `${topSystem} - Problems`,
          data,
          backgroundColor: "#f06292",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Problems in ${topSystem}`,
          font: { size: 18, family: "Oswald" },
        },
        datalabels: {
          anchor: "center",
          align: "center",
          color: "#fff",
          font: { size: 12, weight: "bold", family: "monospace" },
          formatter: Math.round,
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#eee" } },
        x: { ticks: { font: { size: 12 } }, grid: { display: false } },
      },
    },
    plugins: [ChartDataLabels],
  });
}

function getTopPreventiveSystem(groupedData) {
  let maxSystem = null;
  let maxCount = -1;
  for (const [system, counts] of Object.entries(groupedData)) {
    if (counts.Preventive > maxCount) {
      maxCount = counts.Preventive;
      maxSystem = system;
    }
  }
  return maxSystem;
}
