let currentMedications = [];
let patients = [];
let editingIndex = null;

function buildMedicationChartRow(drugName, drug) {
  const species = getSpeciesKey();
  const range = drug[species] || drug.other;
  const doseUsed = getMidDose(range);
  const weight = getWeight();
  const totalMg = (weight !== null) ? weight * doseUsed : null;
  const totalMl = (totalMg !== null && drug.concentration > 0) ? totalMg / drug.concentration : null;
  const safeDrugName = drugName.replace(/'/g, "\\'");

  return `<tr data-drug-name="${drugName}">
    <td><input type="checkbox" class="med-use-toggle" onchange="toggleMedicationUsed()"></td>
    <td><strong>${drugName}</strong><br><span class="muted">${drug.notes}</span></td>
    <td><input type="number" step="0.001" id="dose_${drugName}" value="${doseUsed.toFixed(3)}" oninput="updateMedicationRow('${safeDrugName}')"></td>
    <td><input type="number" step="0.001" id="conc_${drugName}" value="${drug.concentration}" oninput="updateMedicationRow('${safeDrugName}')"></td>
    <td>
      <select id="route_${drugName}" onchange="updateMedicationRow('${safeDrugName}')">
        <option ${drug.route === "IV" ? "selected" : ""}>IV</option>
        <option ${drug.route === "IM" ? "selected" : ""}>IM</option>
        <option ${drug.route === "SC" ? "selected" : ""}>SC</option>
        <option ${drug.route === "PO" ? "selected" : ""}>PO</option>
        <option ${drug.route === "ET" ? "selected" : ""}>ET</option>
        <option ${drug.route === "CRI" ? "selected" : ""}>CRI</option>
        <option ${drug.route === "Other" ? "selected" : ""}>Other</option>
      </select>
    </td>
    <td id="totalmg_${drugName}">${totalMg !== null ? `${totalMg.toFixed(3)} mg` : "-"}</td>
    <td id="totalml_${drugName}">${totalMl !== null ? `${totalMl.toFixed(3)} mL` : "-"}</td>
    <td>${range.low} - ${range.high} mg/kg</td>
    <td><button type="button" class="ghost" onclick="addMedicationFromChart('${safeDrugName}')">Add</button></td>
  </tr>`;
}

function renderMedicationChart() {
  const header = `<tr><th>Use</th><th>Medication</th><th>Dose Used</th><th>Conc.</th><th>Route</th><th>Total mg</th><th>Total mL</th><th>Dose Range</th><th>Add</th></tr>`;
  el("medCalcTable").innerHTML = header + Object.keys(DRUG_LIBRARY).sort().map(name => buildMedicationChartRow(name, DRUG_LIBRARY[name])).join("");
  if (el("autoHideUnused").checked) hideUnusedMedicationRows();
}

function updateMedicationRow(drugName) {
  const weight = getWeight();
  const dose = getNumber(`dose_${drugName}`);
  const concentration = getNumber(`conc_${drugName}`);
  const totalMg = (weight !== null && dose !== null) ? weight * dose : null;
  const totalMl = (totalMg !== null && concentration !== null && concentration > 0) ? totalMg / concentration : null;
  el(`totalmg_${drugName}`).textContent = totalMg !== null ? `${totalMg.toFixed(3)} mg` : "-";
  el(`totalml_${drugName}`).textContent = totalMl !== null ? `${totalMl.toFixed(3)} mL` : "-";
}

function toggleMedicationUsed() {
  if (el("autoHideUnused").checked) hideUnusedMedicationRows();
}
function hideUnusedMedicationRows() {
  document.querySelectorAll("#medCalcTable tr[data-drug-name]").forEach(row => {
    const toggle = row.querySelector(".med-use-toggle");
    row.classList.toggle("hidden-row", !toggle.checked);
  });
}
function showAllMedicationRows() {
  document.querySelectorAll("#medCalcTable tr[data-drug-name]").forEach(row => row.classList.remove("hidden-row"));
}
function addMedicationFromChart(drugName) {
  const dose = getNumber(`dose_${drugName}`);
  const concentration = getNumber(`conc_${drugName}`);
  const route = getValue(`route_${drugName}`);
  const weight = getWeight();
  if (weight === null || dose === null || concentration === null || concentration <= 0) return;
  const totalMg = weight * dose;
  const totalMl = totalMg / concentration;
  currentMedications.push({ name: drugName, dose: `${dose} mg/kg = ${totalMg.toFixed(3)} mg / ${totalMl.toFixed(3)} mL`, route });
  renderMedications();
  persistState();
}

function buildEmergencyDrugRow(drugName, drug) {
  const weight = getWeight();
  const result = getEmergencyDoseResult(drug, weight, drug.concentration);
  const concUnit = drug.concentrationUnit || "mg/mL";
  const safeDrugName = drugName.replace(/'/g, "\\'");
  return `<tr data-emerg-drug-name="${drugName}">
    <td><input type="checkbox" class="emerg-use-toggle" onchange="toggleEmergencyUsed()"></td>
    <td><strong>${drugName}</strong><br><span class="muted">${drug.notes}</span></td>
    <td>${drug.dose} ${drug.unit}</td>
    <td><input type="number" step="0.001" id="emerg_conc_${drugName}" value="${drug.concentration}" oninput="updateEmergencyRow('${safeDrugName}')"><div class="muted">${concUnit}</div></td>
    <td>
      <select id="emerg_route_${drugName}" onchange="updateEmergencyRow('${safeDrugName}')">
        <option ${drug.route === "IV" ? "selected" : ""}>IV</option>
        <option ${drug.route === "IO" ? "selected" : ""}>IO</option>
        <option ${drug.route === "ET" ? "selected" : ""}>ET</option>
        <option ${drug.route === "IM" ? "selected" : ""}>IM</option>
        <option ${drug.route === "Other" ? "selected" : ""}>Other</option>
      </select>
    </td>
    <td id="emerg_totaldose_${drugName}">${result.totalDose !== null ? `${result.totalDose.toFixed(3)} ${result.displayUnit}` : "-"}</td>
    <td id="emerg_totalml_${drugName}">${result.totalMl !== null ? `${result.totalMl.toFixed(3)} mL` : "-"}</td>
    <td><input type="datetime-local" id="emerg_time1_${drugName}"></td>
    <td><input type="datetime-local" id="emerg_time2_${drugName}"></td>
    <td><input type="datetime-local" id="emerg_time3_${drugName}"></td>
    <td><button type="button" class="ghost" onclick="addEmergencyMedicationFromChart('${safeDrugName}')">Add</button></td>
  </tr>`;
}

function renderEmergencyDrugChart() {
  const header = `<tr><th>Use</th><th>Emergency Drug</th><th>RECOVER Dose</th><th>Conc.</th><th>Route</th><th>Total Dose</th><th>Total mL</th><th>Admin Time 1</th><th>Admin Time 2</th><th>Admin Time 3</th><th>Add</th></tr>`;
  el("emergCalcTable").innerHTML = header + Object.keys(EMERGENCY_DRUG_LIBRARY).map(name => buildEmergencyDrugRow(name, EMERGENCY_DRUG_LIBRARY[name])).join("");
  if (el("autoHideUnusedEmergency").checked) hideUnusedEmergencyRows();
}

function updateEmergencyRow(drugName) {
  const weight = getWeight();
  const drug = EMERGENCY_DRUG_LIBRARY[drugName];
  const concentration = getNumber(`emerg_conc_${drugName}`);
  if (!drug) return;
  const result = getEmergencyDoseResult(drug, weight, concentration);
  el(`emerg_totaldose_${drugName}`).textContent = result.totalDose !== null ? `${result.totalDose.toFixed(3)} ${result.displayUnit}` : "-";
  el(`emerg_totalml_${drugName}`).textContent = result.totalMl !== null ? `${result.totalMl.toFixed(3)} mL` : "-";
}
function toggleEmergencyUsed() {
  if (el("autoHideUnusedEmergency").checked) hideUnusedEmergencyRows();
}
function hideUnusedEmergencyRows() {
  document.querySelectorAll("#emergCalcTable tr[data-emerg-drug-name]").forEach(row => {
    const toggle = row.querySelector(".emerg-use-toggle");
    row.classList.toggle("hidden-row", !toggle.checked);
  });
}
function showAllEmergencyRows() {
  document.querySelectorAll("#emergCalcTable tr[data-emerg-drug-name]").forEach(row => row.classList.remove("hidden-row"));
}
function addEmergencyMedicationFromChart(drugName) {
  const drug = EMERGENCY_DRUG_LIBRARY[drugName];
  const weight = getWeight();
  const concentration = getNumber(`emerg_conc_${drugName}`);
  const route = getValue(`emerg_route_${drugName}`);
  if (!drug || weight === null || concentration === null || concentration <= 0) return;
  const result = getEmergencyDoseResult(drug, weight, concentration);
  const times = [getValue(`emerg_time1_${drugName}`), getValue(`emerg_time2_${drugName}`), getValue(`emerg_time3_${drugName}`)].filter(Boolean);
  currentMedications.push({
    name: `${drugName} (Emergency)`,
    dose: `${drug.dose} ${drug.unit} = ${result.totalDose !== null ? result.totalDose.toFixed(3) : "-"} ${result.displayUnit} / ${result.totalMl !== null ? result.totalMl.toFixed(3) : "-"} mL${times.length ? " • Times: " + times.join(" | ") : ""}`,
    route
  });
  renderMedications();
  persistState();
}

function addMedication() {
  const name = getValue("medName").trim();
  const dose = getValue("medDose").trim();
  const route = getValue("medRoute");
  if (!name && !dose) return;
  currentMedications.push({ name, dose, route });
  renderMedications();
  setValue("medName", "");
  setValue("medDose", "");
  setValue("medRoute", "IV");
  persistState();
}

function renderMedications() {
  const table = el("medTable");
  table.innerHTML = "<tr><th>Medication</th><th>Dose</th><th>Route</th></tr>";
  currentMedications.forEach(item => {
    table.innerHTML += `<tr><td>${item.name}</td><td>${item.dose}</td><td>${item.route}</td></tr>`;
  });
}

function renderPatients() {
  const table = el("ptable");
  table.innerHTML = "<tr><th>Name</th><th>Code</th><th>Type</th><th>ASA</th><th>Start</th><th>End</th><th>Recovery</th><th>Actions</th></tr>";
  patients.forEach((item, idx) => {
    table.innerHTML += `<tr><td>${item.name || ""}</td><td>${item.code || ""}</td><td>${item.type || ""}</td><td>${item.asa || ""}</td><td>${item.astart || ""}</td><td>${item.aend || ""}</td><td>${item.recoveryTime || ""}</td><td><button type="button" class="ghost" onclick="loadCase(${idx})">Load</button> <button type="button" class="danger" onclick="deleteCase(${idx})">Delete</button></td></tr>`;
  });
}

function renderSummary(record) {
  const meds = record.medications && record.medications.length ? record.medications.map(m => `${m.name} (${m.route})`).join("; ") : "No medications added";
  el("recordSummary").innerHTML = `
    <div><strong>${record.name || "Unnamed patient"}</strong> • ${record.type || ""} • ${record.sex || ""} • ASA ${record.asa || ""}</div>
    <div>Weight: ${record.weight || "-"} kg | ET Tube: ${record.ett || "-"}</div>
    <div>Intubation: ${record.intubationTime || "-"} | Start: ${record.astart || "-"} | End: ${record.aend || "-"}</div>
    <div>Recovery: ${record.recoveryTime || "-"} | Extubation: ${record.extubationTime || "-"}</div>
    <div>Fluids: ${record.fluidType || "-"} at ${record.fluidRate || "-"} mL/kg/hr • ${record.fluidTotalRate || "-"} • Total ${record.fluidTotalVolume || "-"}</div>
    <div>Medications: ${meds}</div>
    <div>Recovery Notes: ${record.recoveryNotes || "None"}</div>
    <div>Case Notes: ${record.notes || "None"}</div>`;
}
