function updateDiagramModalTable() {
  const tbody = document.getElementById("diagram-table-body");

  const filtered = rows
    .filter((r) =>
      currentDiagramEquipment
        ? normalize(r["Equipment"]) === normalize(currentDiagramEquipment)
        : true
    )
    .filter((r) =>
      diagramWRStatus
        ? r["WR Status"]?.toLowerCase() === diagramWRStatus.toLowerCase()
        : true
    )
    .sort((a, b) => new Date(b["Timestamp"]) - new Date(a["Timestamp"]));

  tbody.innerHTML = filtered
    .map((row) => {
      const imageURL = row[imageColumnKey]?.trim();
      return `
        <tr>
          <td>${formatDate(row["Timestamp"])}</td>
          <td>${row["Work Order Num"] || ""}</td>
          <td>${row["Equipment"] || ""}</td>
          <td>${row["Sub-Component"] || ""}</td>
          <td>${row["Brief Description of Problem or Work"] || ""}</td>
          <td>${row["Detailed Description"] || ""}</td>
          <td>${row["Severity"] || ""}</td>
          <td>${row["*Planning Remarks"] || ""}</td>
          <td>${row["WR Status"] || ""}</td>
          <td>${formatImageLink(imageURL)}</td>
        </tr>
      `;
    })
    .join("");

  updateFilterButtonStates();
}


function updateDiagram() {
  const diagram = document.getElementById("diagram");
  const container = document.querySelector(".diagram-container");

  // Reset filters when switching systems
  diagramWRStatus = "";
  currentSystemFilter = "";

  if (selectedSystemTab === "equipments") {
    container.classList.add("no-diagram");
    diagram.innerHTML = renderFullEquipmentTable();
    setupEquipmentListFilters();
    return;
  }

  container.classList.remove("no-diagram");

  const imagePath = `systems/${selectedSystemTab}`;
  const img = new Image();
  img.onload = () => {
    container.style.backgroundImage = `url("${imagePath}.jpg")`;
  };
  img.onerror = () => {
    container.style.backgroundImage = `url("${imagePath}.png")`;
  };
  img.src = `${imagePath}.jpg`;

  diagram.innerHTML = `<div class="equipment-list-button" onclick="currentDiagramEquipment=''; diagramWRStatus=''; showSystemEquipmentList('${selectedSystemTab}')">EQUIPMENT LIST</div>`;



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

    div.addEventListener("click", () => {
      currentDiagramEquipment = label;
      diagramWRStatus = "";
      updateDiagramModalTable();
      document.getElementById("diagram-modal-title").textContent = label;
      document.getElementById("diagram-modal").classList.remove("hidden");

      // Set filter buttons for equipment modal
      const pendingBtn = document.getElementById("diagram-pending-btn");
      const doneBtn = document.getElementById("diagram-done-btn");

if (!currentDiagramEquipment) {
  pendingBtn.onclick = () => {
    showSystemEquipmentList(systemTabId, "Pending");
  };
  doneBtn.onclick = () => {
    showSystemEquipmentList(systemTabId, "Done");
  };
}



      updateFilterButtonStates();
    });

    diagram.appendChild(div);
  }

  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <div><span class="legend-dot operational"></span>🟢 Operational</div>
    <div><span class="legend-dot sustainable"></span>🟡 Sustainable</div>
    <div><span class="legend-dot breakdown"></span>🔴 Breakdown</div>
  `;
  diagram.appendChild(legend);
}

function showSystemEquipmentList(systemTabId, wrStatus = "") {
  const systemNames = systemGroups[systemTabId] || [];
  const tbody = document.getElementById("diagram-table-body");

  // Toggle filter
  if (wrStatus && currentSystemFilter === wrStatus.toLowerCase()) {
    wrStatus = "";
    currentSystemFilter = "";
  } else {
    currentSystemFilter = wrStatus.toLowerCase();
  }

  const filtered = rows
    .filter((r) => systemNames.includes(r["System"]))
    .filter((r) =>
      wrStatus ? r["WR Status"]?.toLowerCase() === wrStatus.toLowerCase() : true
    )
    .sort((a, b) => new Date(b["Timestamp"]) - new Date(a["Timestamp"]));

  tbody.innerHTML = filtered
    .map((row) => {
      const imageURL = row[imageColumnKey]?.trim();
      return `
        <tr>
          <td>${formatDate(row["Timestamp"])}</td>
          <td>${row["Work Order Num"] || ""}</td>
          <td>${row["Equipment"] || ""}</td>
          <td>${row["Sub-Component"] || ""}</td>
          <td>${row["Brief Description of Problem or Work"] || ""}</td>
          <td>${row["Detailed Description"] || ""}</td>
          <td>${row["Severity"] || ""}</td>
          <td>${row["*Planning Remarks"] || ""}</td>
          <td>${row["WR Status"] || ""}</td>
          <td>${formatImageLink(imageURL)}</td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("diagram-modal-title").textContent = "EQUIPMENT LIST";
  document.getElementById("diagram-modal").classList.remove("hidden");

  // Rebind buttons for this system
  const pendingBtn = document.getElementById("diagram-pending-btn");
  const doneBtn = document.getElementById("diagram-done-btn");

  pendingBtn.onclick = () => {
    showSystemEquipmentList(systemTabId, "Pending");
  };
  doneBtn.onclick = () => {
    showSystemEquipmentList(systemTabId, "Done");
  };

  updateFilterButtonStates();
}

function updateFilterButtonStates() {
  const pendingBtn = document.getElementById("diagram-pending-btn");
  const doneBtn = document.getElementById("diagram-done-btn");

  // For diagram modal per equipment
  const isDiagramMode = !!currentDiagramEquipment;

  pendingBtn.classList.toggle(
    "active",
    isDiagramMode
      ? diagramWRStatus.toLowerCase() === "pending"
      : currentSystemFilter === "pending"
  );

  doneBtn.classList.toggle(
    "active",
    isDiagramMode
      ? diagramWRStatus.toLowerCase() === "done"
      : currentSystemFilter === "done"
  );
}

function getLatestStatusAndBreakdown(dataRows, systemNames) {
  const equipmentSet = new Set(
    dataRows
      .filter((r) => systemNames.includes(r["System"]))
      .map((r) => normalize(r["Equipment"]))
  );

  const latestStatusMap = {};
  const breakdownMap = {};

  const currentPositionMap = positionMaps[selectedSystemTab] || {};
  for (const key of Object.keys(currentPositionMap)) {
    const eq = normalize(key);
    latestStatusMap[eq] = "0";
    breakdownMap[eq] = 0;
  }

  for (let i = dataRows.length - 1; i >= 0; i--) {
    const row = dataRows[i];
    const eq = normalize(row["Equipment"]);
    if (!equipmentSet.has(eq)) continue;

    if (latestStatusMap[eq] === "0" && ["1", "2"].includes(row["Current Status"])) {
      latestStatusMap[eq] = row["Current Status"];
    } else if (!["1", "2"].includes(latestStatusMap[eq]) && ["0", "1", "2"].includes(row["Current Status"])) {
      latestStatusMap[eq] = row["Current Status"];
    }

    if (row["Breakdown Count"]?.toString().trim() === "1") {
      breakdownMap[eq] = (breakdownMap[eq] || 0) + 1;
    }
  }

  return { latestStatusMap, breakdownMap };
}
