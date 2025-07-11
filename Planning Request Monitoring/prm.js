const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJsdbqvJZosavRLmcTpv6POWOtrWlQLSb5hNEttqh4eRAnng2itnoxNqo-KTawzIllbVsBv4huHdOQ/pub?gid=0&single=true&output=csv";

let allData = [];

fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n');
        const csvWithoutFirstRow = rows.slice(1).join('\n');

        Papa.parse(csvWithoutFirstRow, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                allData = results.data;
                generateTable(allData);
            }
        });
    });

function generateTable(data) {
    const headerRow = document.getElementById('tableHeader');
    const body = document.getElementById('tableBody');
    headerRow.innerHTML = '';
    body.innerHTML = '';

    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            if (header.toLowerCase() === 'status') {
                const status = row[header].toLowerCase();
                const badge = document.createElement('span');
                badge.classList.add('badge');
                badge.classList.add(
                    status.includes('done') ? 'done' :
                        status.includes('delayed') ? 'delayed' :
                            status.includes('ongoing') ? 'ongoing' : 'pending'
                );
                badge.textContent = row[header];
                td.appendChild(badge);
            } else {
                td.textContent = row[header];
            }
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

function filterTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = allData.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(input)
        )
    );
    generateTable(filteredData);
}

function redirectWithFade() {
    document.body.classList.remove('fade-in');
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = "prm.html";
    }, 300);
}
function goHome() {
    window.location.href = "../index.html";
}

function goBack() {
    window.history.back();
}
