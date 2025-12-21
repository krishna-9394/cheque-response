let ledgerMap = {};
let responses = [];

// Load ledger.csv
fetch("ledger.csv")
  .then(response => response.text())
  .then(text => {
    const rows = text.trim().split("\n").slice(1);
    const select = document.getElementById("ledgerSelect");
    select.innerHTML = "";

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
  })
  .catch(err => {
    alert("Error loading ledger.csv");
    console.error(err);
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
  if (responses.length === 0) {
    alert("No entries to download");
    return;
  }

  const headers = Object.keys(responses[0]).join(",");
  const rows = responses.map(r =>
    Object.values(r).map(v => `"${v}"`).join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "response.csv";
  a.click();
}
