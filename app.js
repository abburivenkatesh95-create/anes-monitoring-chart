function saveRecord() {
  const record = {
    name: getValue("pname"),
    code: getValue("pcode"),
    weight: getValue("pweight"),
    type: getValue("ptype"),
    sex: getValue("sex"),
    asa: getValue("asa"),
    ett: getValue("ett"),
    intubationTime: getValue("intubationTime"),
    astart: getValue("astart"),
    aend: getValue("aend"),
    extubationTime: getValue("extubationTime"),
    recoveryTime: getValue("recoveryTime"),
    recoveryNotes: getValue("recoveryNotes"),
    fluidType: getValue("fluidType"),
    fluidRate: getValue("fluidRatePerKg"),
    fluidTotalRate: getValue("fluidTotalRate"),
    fluidTotalVolume: getValue("fluidTotalVolume"),
    fluidNote: getValue("fluidNote"),
    notes: getValue("additionalNotes"),
    medications: [...currentMedications],
    chartSnapshot: clone(chartState)
  };
  if (editingIndex !== null && editingIndex >= 0 && editingIndex < patients.length) patients[editingIndex] = record;
  else patients.push(record);
  editingIndex = null;
  renderPatients();
  renderSummary(record);
  persistState();
}

function loadCase(index) {
  const record = patients[index];
  if (!record) return;
  editingIndex = index;
  setValue("pname", record.name);
  setValue("pcode", record.code);
  setValue("pweight", record.weight);
  setValue("ptype", record.type);
  setValue("sex", record.sex);
  setValue("asa", record.asa);
  setValue("ett", record.ett);
  setValue("intubationTime", record.intubationTime);
  setValue("astart", record.astart);
  setValue("aend", record.aend);
  setValue("extubationTime", record.extubationTime);
  setValue("recoveryTime", record.recoveryTime);
  setValue("recoveryNotes", record.recoveryNotes);
  setValue("fluidType", record.fluidType);
  setValue("fluidRatePerKg", record.fluidRate);
  setValue("fluidTotalRate", record.fluidTotalRate);
  setValue("fluidTotalVolume", record.fluidTotalVolume);
  setValue("fluidNote", record.fluidNote);
  setValue("additionalNotes", record.notes);
  currentMedications = [...(record.medications || [])];
  renderMedications();
  renderSummary(record);
  if (record.chartSnapshot) {
    chartState.labels = record.chartSnapshot.labels || [];
    chartState.datasets.forEach((ds, idx) => { ds.data = record.chartSnapshot.datasets?.[idx]?.data || []; });
    t = chartState.labels.length;
    chart.update();
  }
  updateAllCalculators();
  scrollToTopApp();
  persistState();
}

function deleteCase(index) {
  patients.splice(index, 1);
  if (editingIndex === index) editingIndex = null;
  renderPatients();
  persistState();
}

function clearAllData() {
  editingIndex = null;
  [
    "pname","pcode","pweight","ett","intubationTime","astart","fluidRatePerKg","fluidHours","fluidTotalRate","fluidTotalVolume",
    "dripOut","bolusRate","bolusTotal","shockDoseTotal","fluidNote","additionalNotes","hr","spo2","etco2","rr","temp","sbp","dbp",
    "map","o2flow","vaporizer","medName","medDose","aend","extubationTime","recoveryTime","recoveryNotes"
  ].forEach(id => setValue(id, ""));
  setValue("ptype", "Canine");
  setValue("sex", "Male");
  setValue("asa", "I");
  setValue("fluidType", "Lactated Ringer's Solution (LRS)");
  setValue("gttFactor", "10");
  setValue("medRoute", "IV");
  setValue("fluidRatePerKg", "5");
  setValue("fluidHours", "1");
  setValue("bolusRate", "10");
  currentMedications = [];
  renderMedications();
  clearData();
  updateFluidCalculator();
  previewAlarms();
  persistState();
}

function fillNowTimes() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  if (!getValue("astart")) setValue("astart", formatted);
  if (!getValue("intubationTime")) setValue("intubationTime", formatted);
  persistState();
}

function scrollToTopApp() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function runSelfCheck() {
  const checks = [
    typeof showAllMedicationRows === "function",
    typeof hideUnusedMedicationRows === "function",
    typeof showAllEmergencyRows === "function",
    typeof renderMedicationChart === "function",
    typeof renderEmergencyDrugChart === "function",
    el("medCalcTable") !== null,
    el("emergCalcTable") !== null
  ];
  if (!checks.every(Boolean)) console.error("Self-check failed", checks);
}

function updateAllCalculators() {
  updateFluidCalculator();
  renderMedicationChart();
  renderEmergencyDrugChart();
  previewAlarms();
  persistState();
}

function bindEvents() {
  ["pweight","ptype","fluidRatePerKg","fluidHours","gttFactor","bolusRate"].forEach(id => {
    const node = el(id);
    if (node) {
      node.addEventListener("input", updateAllCalculators);
      node.addEventListener("change", updateAllCalculators);
    }
  });

  ["hr","spo2","etco2","rr","temp","sbp","dbp","map"].forEach(id => {
    const node = el(id);
    if (node) node.addEventListener("input", previewAlarms);
  });

  el("saveRecordBtn").addEventListener("click", saveRecord);
  el("saveToDeviceBtn").addEventListener("click", saveToDevice);
  el("clearAllBtn").addEventListener("click", clearAllData);
  el("refreshMedicationChartBtn").addEventListener("click", renderMedicationChart);
  el("showAllMedicationRowsBtn").addEventListener("click", showAllMedicationRows);
  el("hideUnusedMedicationRowsBtn").addEventListener("click", hideUnusedMedicationRows);
  el("refreshEmergencyChartBtn").addEventListener("click", renderEmergencyDrugChart);
  el("showAllEmergencyRowsBtn").addEventListener("click", showAllEmergencyRows);
  el("hideUnusedEmergencyRowsBtn").addEventListener("click", hideUnusedEmergencyRows);
  el("addDataBtn").addEventListener("click", addData);
  el("clearChartBtn").addEventListener("click", clearData);
  el("useCurrentTimeBtn").addEventListener("click", fillNowTimes);
  el("addMedicationBtn").addEventListener("click", addMedication);
  el("printBtn").addEventListener("click", () => window.print());
  el("backToTopBtn").addEventListener("click", scrollToTopApp);
  el("exportCasesBtn").addEventListener("click", exportCases);
  el("importCasesBtn").addEventListener("click", importCasesPrompt);
  window.addEventListener("beforeunload", persistState);
}

function initApp() {
  renderMedications();
  renderMedicationChart();
  renderEmergencyDrugChart();
  renderPatients();
  updateFluidCalculator();
  loadPersistedState();
  previewAlarms();
  runSelfCheck();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initApp);
