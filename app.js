let ledgerMap = {};

// Load ledger.csv
fetch("ledger.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n").slice(1);
    const select = document.getElementById("ledgerSelect");

    rows.forEach(row => {
      const cols = row.split(",");
      const ledgerName = cols[1].trim();

      ledgerMap[ledgerName] = {
        under: cols[2],
        state: cols[3],
        gstType: cols[4],
        gstin: cols[5]
      };

      const option = document.createElement("option");
      option.value = ledgerName;
      option.textContent = ledgerName;
      select.appendChild(option);
    });
  });

function addEntry() {
  const ledger = document.getElementById("ledgerSelect").value;

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
    .then(() => alert("Saved successfully"))
    .catch(() => alert("Error saving data"));
}

function downloadCSV() {
  window.location.href = "/api/cheque?download=true";
}

