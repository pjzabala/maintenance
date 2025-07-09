// Dropdown behavior
const dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
dropdownWrappers.forEach((wrapper) => {
  const dropdown = wrapper.querySelector(".dropdown");

  wrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown").forEach((d) => {
      if (d !== dropdown) d.style.display = "none";
    });
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });
});

document.querySelectorAll(".dropdown").forEach(dropdown => {
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation(); // ← This prevents the click from bubbling up and closing it
  });
});
document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    // If the click is outside the dropdown and its wrapper, close it
    const wrapper = dropdown.closest(".dropdown-wrapper");
    if (!wrapper.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
});

const sheetCSVUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRoTu1psI2FA0JCVZy32GDnjKZOhF2_I2VFvAml8JDS2vLG24Uh_U7tUVvtsbCylC-fXksZStYrqWlb/pub?gid=0&single=true&output=csv";

let originalData = [];
let currentChart = null;
let yearlyChart = null;

async function loadCSVData() {
  const response = await fetch(sheetCSVUrl);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

function groupBySystemAndMaintenance(data) {
  const result = {};
  data.forEach((entry) => {
    const system = entry["SYSTEM"] || "SYSTEM";
    const type = (entry["TYPE OF MAINTENANCE"] || "").toLowerCase();

    if (!result[system]) {
      result[system] = {
        Preventive: 0,
        Corrective: 0,
        Modification: 0,
      };
    }

    if (type.includes("preventive")) result[system].Preventive++;
    else if (type.includes("corrective")) result[system].Corrective++;
    else if (type.includes("modification")) result[system].Modification++;
  });

  return result;
}

function renderGroupedChart(groupedData) {
  const priorityOrder = [
    "Slag Removal System",
    "Fly Ash Handling System",
    "Limestone Handling System",
    "Combustion System",
    "Water Treatment System",
    "Coal Handling System",
    "Biomass Handling System",
    "Feedwater System",
    "Circulating Water System",
    "Close Circulating Cooling Water System"
  ];

  const sortable = Object.entries(groupedData).map(([system, counts]) => {
    const total = counts.Preventive + counts.Corrective + counts.Modification;
    return { system, ...counts, total };
  });

  // Filter and sort priority systems by Preventive count
  const priorityItems = priorityOrder
    .map(name => sortable.find(item => item.system === name))
    .filter(Boolean)
    .sort((a, b) => b.Preventive - a.Preventive); // 🔼 sort by Preventive

  // Fill up to 10 items
  const combined = priorityItems.slice(0, 10);

  const systems = combined.map((item) => item.system);
  const preventiveData = combined.map((item) => item.Preventive);
  const correctiveData = combined.map((item) => item.Corrective);
  const modificationData = combined.map((item) => item.Modification);

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
          backgroundColor: "#81c784",
          borderRadius: 6,
          borderColor: "#4caf50",
          borderWidth: 1,
        },
        {
          label: "Corrective",
          data: correctiveData,
          backgroundColor: "#64b5f6",
          borderRadius: 6,
          borderColor: "#2196f3",
          borderWidth: 1,
        },
        {
          label: "Modification",
          data: modificationData,
          backgroundColor: "#ffb74d",
          borderRadius: 6,
          borderColor: "#ff9800",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
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
          text: `History Records`,
          font: { size: 18, family: "Oswald" },
          padding: { top: 10, bottom: 20 },
        },
        datalabels: {
          color: "#fff",
          anchor: "center",
          align: "center",
          font: {
            weight: "bold",
            size: 12,
            family: "monospace",
          },
          formatter: Math.round,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "#eee" },
        },
        x: {
          grid: { display: false },
        },
      },
    },
    plugins: [ChartDataLabels]
  });
}



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





function populateFilters(data) {
  const systems = new Set();
  const equipments = new Set();
  const maintenances = new Set();
  const problems = new Set();
  const section = new Set();
  const years = new Set();

  data.forEach((row) => {
    if (row["SYSTEM"]) systems.add(row["SYSTEM"]);
    if (row["EQUIPMENT ID NO."]) equipments.add(row["EQUIPMENT ID NO."]);
    if (row["TYPE OF MAINTENANCE"]) maintenances.add(row["TYPE OF MAINTENANCE"]);
    if (row["TYPE OF PROBLEM/ACTIVITY"]) problems.add(row["TYPE OF PROBLEM/ACTIVITY"]);
    if (row["POINT SECTION"]) section.add(row["POINT SECTION"]);
    const date = new Date(row["DATE STARTED"]);
if (!isNaN(date)) years.add(date.getFullYear().toString()); // ✅ convert to string

  });

  fillSelect("filter-system", Array.from(systems));
  fillSelect("filter-equipment", Array.from(equipments));
  fillSelect("filter-maintenance", Array.from(maintenances));
  fillSelect("filter-problem", Array.from(problems));
  fillSelect("filter-section", Array.from(section));
  fillSelect("filter-year", Array.from(years));

  fillSelect("filter-quarter", ["Q1", "Q2"]);
}

function fillSelect(id, values) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  const wrapper = container.closest(".custom-dropdown");
  const toggleBtn = wrapper.querySelector(".dropdown-toggle");
  const labelPrefix = toggleBtn.textContent.trim().split(":")[0]; // e.g., "Quarter"

  // Add search box
  const searchDiv = document.createElement("div");
  searchDiv.innerHTML = `<input type="text" placeholder="Search..." class="dropdown-search" />`;
  container.appendChild(searchDiv);

  // Add "All" checkbox
  const allDiv = document.createElement("div");
  allDiv.innerHTML = `<label><input type="checkbox" value="__ALL__" checked> All</label>`;
  container.appendChild(allDiv);

  // Add options
  values.sort().forEach((value) => {
    const div = document.createElement("div");
    div.classList.add("dropdown-item");
    div.innerHTML = `<label><input type="checkbox" value="${value}"> ${value}</label>`;
    container.appendChild(div);
  });

  // Change listener for checkboxes
  container.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const allCheckbox = container.querySelector('input[value="__ALL__"]');
      const otherCheckboxes = [...container.querySelectorAll('input:not([value="__ALL__"])')];

      if (checkbox.value === "__ALL__") {
        otherCheckboxes.forEach(cb => cb.checked = false);
      } else {
        allCheckbox.checked = false;
      }

      // ⬇️ Update button label
      const selectedValues = [...container.querySelectorAll('input[type="checkbox"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== "__ALL__");

      if (selectedValues.length === 0) {
        toggleBtn.textContent = labelPrefix;
      } else {
        toggleBtn.textContent = `${labelPrefix}: ${selectedValues.slice(0, 2).join(", ")}${selectedValues.length > 2 ? ", +" : ""}`;
      }

      updateChart();
    });
  });

  // Search logic
  const searchInput = container.querySelector(".dropdown-search");
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    container.querySelectorAll(".dropdown-item").forEach((div) => {
      const label = div.textContent.toLowerCase();
      div.style.display = label.includes(filter) ? "block" : "none";
    });
  });
}



function getSelectedValues(containerId) {
  const container = document.getElementById(containerId);
  const checked = [...container.querySelectorAll('input:checked')]
    .map(cb => cb.value);
  return checked.includes("__ALL__") ? [] : checked;
}

function applyFilters(data) {
  const selectedSystems = getSelectedValues("filter-system");
  const selectedEquipment = getSelectedValues("filter-equipment");
  const selectedMaintenance = getSelectedValues("filter-maintenance");
  const selectedProblems = getSelectedValues("filter-problem");
  const selectedSection = getSelectedValues("filter-section");
  const selectedYears = getSelectedValues("filter-year");
  const selectedQuarters = getSelectedValues("filter-quarter");

  const startDate = document.getElementById("filter-date-start").value;
  const endDate = document.getElementById("filter-date-end").value;

  return data.filter((row) => {
    const rowDate = new Date(row["DATE FINISHED"]);

    const matchSystem = selectedSystems.length === 0 || selectedSystems.includes(row["SYSTEM"]);
    const matchEquipment = selectedEquipment.length === 0 || selectedEquipment.includes(row["EQUIPMENT ID NO."]);
    const matchMaintenance = selectedMaintenance.length === 0 || selectedMaintenance.includes(row["TYPE OF MAINTENANCE"]);
    const matchProblem = selectedProblems.length === 0 || selectedProblems.includes(row["TYPE OF PROBLEM/ACTIVITY"]);
    const matchSection = selectedSection.length === 0 || selectedSection.includes(row["POINT SECTION"]);
    const matchYear = selectedYears.length === 0 || selectedYears.includes(rowDate.getFullYear().toString());
    const matchStart = !startDate || rowDate >= new Date(startDate);
    const matchEnd = !endDate || rowDate <= new Date(endDate);

    let matchQuarter = true;
    if (selectedQuarters.length > 0) {
      matchQuarter = selectedQuarters.some((q) => {
        if (q === "Q1") {
          const start = new Date(rowDate.getFullYear(), 0, 1);
          const end = new Date(rowDate.getFullYear(), 2, 31);
          return rowDate >= start && rowDate <= end;
        } else if (q === "Q2") {
          const start = new Date(rowDate.getFullYear(), 3, 1);
          const end = new Date(rowDate.getFullYear(), 5, 30);
          return rowDate >= start && rowDate <= end;
        }
        return false;
      });
    }

    return matchSystem && matchEquipment && matchMaintenance && matchProblem && matchStart && matchEnd && matchQuarter && matchSection &&  matchYear;
  });
}


function updateChart() {
  const filtered = applyFilters(originalData);
  const grouped = groupBySystemAndMaintenance(filtered);
  renderGroupedChart(grouped);
  renderYearlyTrendChart(filtered);
}

function clearAllFilters() {
  document.querySelectorAll(".dropdown input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.getElementById("filter-date-start").value = "";
  document.getElementById("filter-date-end").value = "";

  updateChart();
}


loadCSVData().then((data) => {
  originalData = data;
  populateFilters(data);
  updateChart();

  document.getElementById("clear-filters").addEventListener("click", clearAllFilters);

  [
    "filter-system",
    "filter-equipment",
    "filter-maintenance",
    "filter-problem",
    "filter-section",
    "filter-year",
    "filter-date-start",
    "filter-date-end",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", updateChart);
  });
});
