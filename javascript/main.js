// === Cleaned & Improved system.js ===
let rows = [];
let imageColumnKey = "";
let selectedSystemTab = "equipments";
let currentDiagramEquipment = "";
let diagramWRStatus = "";

fetch(sheetURL)
  .then((res) => res.text())
  .then((csvText) => {
    const parsed = Papa.parse(csvText, { header: true });
    rows = parsed.data;
    imageColumnKey = parsed.meta.fields.find((c) =>
      c.toLowerCase().includes("image")
    );
    updateDiagram();
  });

function showTab(event, tabId) {
  document.querySelectorAll(".tab-button").forEach((btn) =>
    btn.classList.remove("active")
  );
  event.target.classList.add("active");
  selectedSystemTab = tabId;
  updateDiagram();
}

function setupEquipmentListFilters() {
  const tbody = document.getElementById("equipment-list-body");
  const systemFilter = document.getElementById("equipment-system-filter");
  const equipmentFilter = document.getElementById("equipment-name-filter");
  const pendingBtn = document.getElementById("equipment-pending-btn");
  const doneBtn = document.getElementById("equipment-done-btn");

  let currentStatusFilter = "";

  function updateFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach((btn) =>
      btn.classList.remove("active")
    );

    if (currentStatusFilter === "Pending") {
      pendingBtn.classList.add("active");
    } else if (currentStatusFilter === "Done") {
      doneBtn.classList.add("active");
    }
  }

  function renderTable() {
    const selectedSystem = systemFilter.value.trim();
    const selectedEquipment = equipmentFilter.value.trim();

    const filtered = rows
      .filter((r) => !selectedSystem || r["System"] === selectedSystem)
      .filter((r) => !selectedEquipment || r["Equipment"] === selectedEquipment)
      .filter((r) =>
        currentStatusFilter
          ? r["WR Status"]?.toLowerCase() === currentStatusFilter.toLowerCase()
          : true
      );

    filtered.sort((a, b) => new Date(b["Timestamp"]) - new Date(a["Timestamp"]));

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
  }

  systemFilter.addEventListener("change", renderTable);
  equipmentFilter.addEventListener("change", renderTable);
  pendingBtn.addEventListener("click", () => {
    currentStatusFilter = currentStatusFilter === "Pending" ? "" : "Pending";
    updateFilterButtons();
    renderTable();
  });
  doneBtn.addEventListener("click", () => {
    currentStatusFilter = currentStatusFilter === "Done" ? "" : "Done";
    updateFilterButtons();
    renderTable();
  });

  updateFilterButtons();
  renderTable();
}

function renderFullEquipmentTable() {
  const systemOptions = [...new Set(rows.map(r => r["System"]).filter(Boolean))]
    .map(sys => `<option value="${sys}">${sys}</option>`)
    .join("");
  const equipmentOptions = [...new Set(rows.map(r => r["Equipment"]).filter(Boolean))]
    .map(eq => `<option value="${eq}">${eq}</option>`)
    .join("");

  return `
    <div class="filter-container">
      <label>
        <select id="equipment-system-filter">
          <option value="">All Systems</option>
          ${systemOptions}
        </select>
      </label>
      <label>
        <select id="equipment-name-filter">
          <option value="">All Equipment</option>
          ${equipmentOptions}
        </select>
      </label>
      <div class="status-toggle-buttons">
        <button id="equipment-pending-btn" class="filter-btn">Pending</button>
        <button id="equipment-done-btn" class="filter-btn">Done</button>
      </div>
    </div>

    <div class="table-container full-table">
      <table class="equipment-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Work Order Num</th>
            <th>Equipment</th>
            <th>Sub-Component</th>
            <th>Brief Description</th>
            <th>Detailed Description</th>
            <th>Severity</th>
            <th>Planning Remarks</th>
            <th>WR Status</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="equipment-list-body"></tbody>
      </table>
    </div>
  `;
}


document.getElementById("diagram-pending-btn").addEventListener("click", () => {
  diagramWRStatus = diagramWRStatus === "Pending" ? "" : "Pending";
  updateDiagramModalTable();
});

document.getElementById("diagram-done-btn").addEventListener("click", () => {
  diagramWRStatus = diagramWRStatus === "Done" ? "" : "Done";
  updateDiagramModalTable();
});

document.getElementById("diagram-modal-close").addEventListener("click", () => {
  document.getElementById("diagram-modal").classList.add("hidden");
});

document.getElementById("equipment-modal-close").addEventListener("click", () => {
  document.getElementById("equipment-modal").classList.add("hidden");
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("image-popup-link")) {
    e.preventDefault();
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("image-modal-img");
    modalImg.src = e.target.href;
    modal.classList.remove("hidden");
  }
});

document.getElementById("image-modal-close").addEventListener("click", () => {
  document.getElementById("image-modal").classList.add("hidden");
  document.getElementById("image-modal-img").src = "";
});

