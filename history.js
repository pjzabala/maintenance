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
  const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(sheetCSVUrl);
  const response = await fetch(proxyUrl);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

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

let problemChart = null;


function populateFilters(data, selectedFilters) {
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
    if (!isNaN(date)) years.add(date.getFullYear().toString());
  });

  fillSelect("filter-system", Array.from(systems), selectedFilters.system);
  fillSelect("filter-equipment", Array.from(equipments), selectedFilters.equipment);
  fillSelect("filter-maintenance", Array.from(maintenances), selectedFilters.maintenance);
  fillSelect("filter-problem", Array.from(problems), selectedFilters.problem);
  fillSelect("filter-section", Array.from(section), selectedFilters.section);
  fillSelect("filter-year", Array.from(years), selectedFilters.year);
  fillSelect("filter-quarter", ["Q1", "Q2", "Q3", "Q4"], selectedFilters.quarter);

}

function fillSelect(id, values, selected = []) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  const searchDiv = document.createElement("div");
  searchDiv.innerHTML = `<input type="text" placeholder="Search..." class="dropdown-search" />`;
  container.appendChild(searchDiv);

  const allDiv = document.createElement("div");
  const allChecked = selected.length === 0;
  allDiv.innerHTML = `
    <label><input type="checkbox" value="__ALL__" ${allChecked ? "checked" : ""}> All</label>
  `;
  container.appendChild(allDiv);

  values.sort().forEach((value) => {
    const isChecked = selected.includes(value);
    const div = document.createElement("div");
    div.classList.add("dropdown-item");
    div.innerHTML = `
      <label><input type="checkbox" value="${value}" ${isChecked ? "checked" : ""}> ${value}</label>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const allCheckbox = container.querySelector('input[value="__ALL__"]');
      const otherCheckboxes = [...container.querySelectorAll('input:not([value="__ALL__"])')];
      if (checkbox.value === "__ALL__") {
        otherCheckboxes.forEach((cb) => (cb.checked = false));
      } else {
        allCheckbox.checked = false;
      }
      updateChart();
    });
  });

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
        const year = rowDate.getFullYear();
        const ranges = {
          Q1: [new Date(year, 0, 1), new Date(year, 2, 31)],    // Jan 1 – Mar 31
          Q2: [new Date(year, 3, 1), new Date(year, 5, 30)],    // Apr 1 – Jun 30
          Q3: [new Date(year, 6, 1), new Date(year, 8, 30)],    // Jul 1 – Sep 30
          Q4: [new Date(year, 9, 1), new Date(year, 11, 31)]    // Oct 1 – Dec 31
        };
        const [start, end] = ranges[q] || [];
        return rowDate >= start && rowDate <= end;
      });
    }


    return matchSystem && matchEquipment && matchMaintenance && matchProblem && matchStart && matchEnd && matchQuarter && matchSection && matchYear;
  });
}


function updateChart() {
  const selectedFilters = {
    system: getSelectedValues("filter-system"),
    equipment: getSelectedValues("filter-equipment"),
    maintenance: getSelectedValues("filter-maintenance"),
    problem: getSelectedValues("filter-problem"),
    section: getSelectedValues("filter-section"),
    year: getSelectedValues("filter-year"),
    quarter: getSelectedValues("filter-quarter"),
  };

  const filtered = applyFilters(originalData); // ✅ Declare only once

  populateFilters(originalData, selectedFilters);

  // If you're on the dashboard, render the charts
  if (typeof renderGroupedChart === "function" &&
    typeof renderYearlyTrendChart === "function" &&
    typeof renderProblemChart === "function") {

    const grouped = groupBySystemAndMaintenance(filtered);
    renderGroupedChart(grouped);

    renderYearlyTrendChart(filtered);

    const topSystem = Object.entries(grouped)
      .sort((a, b) => b[1].Preventive - a[1].Preventive)?.[0]?.[0];

    const groupedProblems = groupProblemsBySystem(filtered);
    renderProblemChart(groupedProblems, topSystem);
  }

  // If you're on the table page, render the table
  if (typeof renderTable === "function") {
    renderTable(filtered);
  }
}

document.getElementById("view-table-btn").addEventListener("click", () => {
  const params = new URLSearchParams();
  const filters = {
    system: getSelectedValues("filter-system"),
    equipment: getSelectedValues("filter-equipment"),
    maintenance: getSelectedValues("filter-maintenance"),
    problem: getSelectedValues("filter-problem"),
    section: getSelectedValues("filter-section"),
    year: getSelectedValues("filter-year"),
    quarter: getSelectedValues("filter-quarter"),
    start: document.getElementById("filter-date-start").value,
    end: document.getElementById("filter-date-end").value,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  });



  window.location.href = `historytable.html?${params.toString()}`;

});


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
  populateFilters(data, {
    system: [],
    equipment: [],
    maintenance: [],
    problem: [],
    section: [],
    year: [],
  });
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
