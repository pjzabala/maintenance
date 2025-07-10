// === Dropdown behavior ===
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

document.querySelectorAll(".dropdown").forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
});


function fillSelect(id, values, selected = []) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  const searchDiv = document.createElement("div");
  searchDiv.innerHTML = `<input type="text" placeholder="Search..." class="dropdown-search" />`;
  container.appendChild(searchDiv);

  const allDiv = document.createElement("div");
  const allChecked = selected.length === 0;
  allDiv.innerHTML = `<label><input type="checkbox" value="__ALL__" ${allChecked ? "checked" : ""}> All</label>`;
  container.appendChild(allDiv);

  values.sort().forEach((value) => {
    const div = document.createElement("div");
    div.classList.add("dropdown-item");
    div.innerHTML = `<label><input type="checkbox" value="${value}" ${selected.includes(value) ? "checked" : ""}> ${value}</label>`;
    container.appendChild(div);
  });

  const searchInput = container.querySelector(".dropdown-search");
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    container.querySelectorAll(".dropdown-item").forEach((div) => {
      const label = div.textContent.toLowerCase();
      div.style.display = label.includes(filter) ? "block" : "none";
    });
  });

  container.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("mousedown", (e) => {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;

      const allCheckbox = container.querySelector('input[value="__ALL__"]');
      const others = [...container.querySelectorAll('input:not([value="__ALL__"])')];

      if (checkbox.value === "__ALL__") {
        others.forEach(cb => cb.checked = false);
      } else {
        allCheckbox.checked = false;
      }

      updateTable();
    });
  });
}

function getSelectedValues(containerId) {
  const container = document.getElementById(containerId);
  const checked = [...container.querySelectorAll('input:checked')].map(cb => cb.value);
  return checked.includes("__ALL__") ? [] : checked;
}
