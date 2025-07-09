function updateDiagram() {
  const diagram = document.getElementById("diagram");
  const container = document.querySelector(".diagram-container");

  if (selectedSystemTab === "equipments") {
    container.classList.add("no-diagram");
    diagram.innerHTML = renderFullEquipmentTable();
    setupEquipmentListFilters();
    return;
  }

  container.classList.remove("no-diagram");

  // Support both .jpg and .png image fallback
  const imagePath = `systems/${selectedSystemTab}`;
  const img = new Image();
  img.onload = () => {
    container.style.backgroundImage = `url("${imagePath}.jpg")`;
  };
  img.onerror = () => {
    container.style.backgroundImage = `url("${imagePath}.png")`;
  };
  img.src = `${imagePath}.jpg`;

  diagram.innerHTML = `<div class="equipment-list-button" onclick="showEquipmentList()">EQUIPMENT LIST</div>`;

  const systemNames = systemGroups[selectedSystemTab] || [];
  const { latestStatusMap, breakdownMap } = getLatestStatusAndBreakdown(rows, systemNames);
  const currentPositionMap = positionMaps[selectedSystemTab] || {};
  const statusEmoji = { 0: "🟢", 1: "🟡", 2: "🔴" };

  for (const [label, coords] of Object.entries(currentPositionMap)) {
    const eqNorm = normalize(label);
    const status = latestStatusMap[eqNorm] ?? "0";
    const breakdown = breakdownMap[eqNorm] ?? 0;

    const div = document.createElement("div");
    div.className =
      "status-indicator " +
      (status === "0"
        ? "operational"
        : status === "1"
        ? "sustainable"
        : "breakdown");

    div.style.left = `${coords.x}px`;
    div.style.top = `${coords.y}px`;
    div.title = `${label} | Status: ${status}, Breakdowns: ${breakdown}`;

    const emoji = encodeURIComponent(statusEmoji[status]);
    div.style.backgroundImage = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28'>${emoji}</text></svg>")`;
    div.innerHTML = `<div class="count">${breakdown}</div>`;

    diagram.appendChild(div);
  }
  // ✅ Append legend at the bottom center of diagram container
  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <div><span class="legend-dot operational"></span>🟢 Operational</div>
    <div><span class="legend-dot sustainable"></span>🟡 Sustainable</div>
    <div><span class="legend-dot breakdown"></span>🔴 Breakdown</div>
  `;
  diagram.appendChild(legend);
}


function getLatestStatusAndBreakdown(dataRows, systemNames) {
  const equipmentSet = new Set(
    dataRows
      .filter((r) => systemNames.includes(r["System"]))
      .map((r) => normalize(r["Equipment"]))
  );

  const latestStatusMap = {};
  const breakdownMap = {};

  // Initialize all equipment positions with default status 0
  const currentPositionMap = positionMaps[selectedSystemTab] || {};
  for (const key of Object.keys(currentPositionMap)) {
    const eq = normalize(key);
    latestStatusMap[eq] = "0";
    breakdownMap[eq] = 0;
  }

  // Iterate from latest to oldest to find latest status per equipment
  for (let i = dataRows.length - 1; i >= 0; i--) {
    const row = dataRows[i];
    const eq = normalize(row["Equipment"]);
    if (!equipmentSet.has(eq)) continue;

    // Only set if not already recorded
    if (latestStatusMap[eq] === "0" && ["1", "2"].includes(row["Current Status"])) {
      latestStatusMap[eq] = row["Current Status"];
    } else if (!["1", "2"].includes(latestStatusMap[eq]) && ["0", "1", "2"].includes(row["Current Status"])) {
      latestStatusMap[eq] = row["Current Status"];
    }

    // Count breakdowns
    if (row["Breakdown Count"]?.toString().trim() === "1") {
      breakdownMap[eq] = (breakdownMap[eq] || 0) + 1;
    }
  }

  return { latestStatusMap, breakdownMap };
}