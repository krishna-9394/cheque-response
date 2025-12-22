let ledgerMap = {};

// Load ledger.csv
fetch("ledger.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n").slice(1);
    const datalist = document.getElementById("ledgerList");

    rows.forEach(row => {
      const commaIndex = row.indexOf(',');
      if (commaIndex === -1) return; // skip invalid rows
      const gstin = row.substring(0, commaIndex).trim();
      const ledgerName = row.substring(commaIndex + 1).trim();

      ledgerMap[ledgerName] = {
        gstin: gstin,
        under: '',
        state: '',
        gstType: ''
      };

      const option = document.createElement("option");
      option.value = ledgerName;
      datalist.appendChild(option);
    });

    loadTable();
  });

function addEntry() {
  const ledger = document.getElementById("ledgerSelect").value;

  if (!ledgerMap[ledger]) {
    alert("Please select a valid ledger from the list.");
    return;
  }

  const payload = {
    reference_cheque_date: document.getElementById("refDate").value,
    cheque_number: document.getElementById("chequeNo").value,
    amount: document.getElementById("amount").value,
    name_of_ledger: ledger,
    under: ledgerMap[ledger].under,
    state_name: ledgerMap[ledger].state,
    gst_registration_type: ledgerMap[ledger].gstType,
    gstin: ledgerMap[ledger].gstin
  };

  fetch("/api/cheque", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(() => {
      alert("Saved successfully");
      loadTable();
    })
    .catch(() => alert("Error saving data"));
}

function downloadCSV() {
  window.location.href = "/api/cheque?download=true";
}

function loadTable() {
  fetch('/api/cheque')
    .then(res => {
      if (res.status === 404) {
        document.getElementById('tableContainer').innerHTML = '<p>No data available.</p>';
        return '';
      }
      return res.text();
    })
    .then(csv => {
      if (csv === '') return;
      const rows = csv.trim().split('\n');
      const headers = rows[0].split(',').map(h => h.replace(/"/g, ''));
      const data = rows.slice(1).map(row => {
        // Find the 5th comma to split properly since Name of Ledger can contain commas
        let commaCount = 0;
        let splitIndex = -1;
        for (let i = 0; i < row.length; i++) {
          if (row[i] === ',') {
            commaCount++;
            if (commaCount === 5) {
              splitIndex = i;
              break;
            }
          }
        }
        if (splitIndex === -1) return []; // invalid row
        const firstFiveFields = row.substring(0, splitIndex);
        const ledgerName = row.substring(splitIndex + 1);
        // Parse the first five fields
        const fields = firstFiveFields.split(',').map(cell => cell.replace(/"/g, ''));
        // Add the ledger name (remove quotes if present)
        fields.push(ledgerName.replace(/"/g, ''));
        return fields;
      }).filter(row => row.length > 0); // remove invalid rows

      let tableHtml = '<table border="1"><thead><tr>';
      headers.forEach(h => tableHtml += `<th>${h}</th>`);
      tableHtml += '</tr></thead><tbody>';
      data.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => tableHtml += `<td>${cell}</td>`);
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';
      document.getElementById('tableContainer').innerHTML = tableHtml;
    })
    .catch(err => {
      console.error('Error loading table:', err);
      document.getElementById('tableContainer').innerHTML = '<p>Error loading data.</p>';
    });
}
