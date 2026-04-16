const STORAGE_KEY = "anes_monitoring_chart_state_split_v1";

function gatherFormState() {
  return {
    editingIndex,
    patients,
    currentMedications,
    t,
    chartState: clone(chartState),
    fields: {
      pname: getValue("pname"), pcode: getValue("pcode"), pweight: getValue("pweight"), ptype: getValue("ptype"), sex: getValue("sex"), asa: getValue("asa"), ett: getValue("ett"), intubationTime: getValue("intubationTime"), astart: getValue("astart"),
      fluidType: getValue("fluidType"), fluidRatePerKg: getValue("fluidRatePerKg"), fluidHours: getValue("fluidHours"), fluidTotalRate: getValue("fluidTotalRate"), fluidTotalVolume: getValue("fluidTotalVolume"), gttFactor: getValue("gttFactor"), dripOut: getValue("dripOut"), bolusRate: getValue("bolusRate"), bolusTotal: getValue("bolusTotal"), shockDoseTotal: getValue("shockDoseTotal"), fluidNote: getValue("fluidNote"),
      additionalNotes: getValue("additionalNotes"), hr: getValue("hr"), spo2: getValue("spo2"), etco2: getValue("etco2"), rr: getValue("rr"), temp: getValue("temp"), sbp: getValue("sbp"), dbp: getValue("dbp"), map: getValue("map"), o2flow: getValue("o2flow"), vaporizer: getValue("vaporizer"),
      medName: getValue("medName"), medDose: getValue("medDose"), medRoute: getValue("medRoute"), aend: getValue("aend"), extubationTime: getValue("extubationTime"), recoveryTime: getValue("recoveryTime"), recoveryNotes: getValue("recoveryNotes")
    }
  };
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gatherFormState()));
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    editingIndex = state.editingIndex ?? null;
    patients = state.patients || [];
    currentMedications = state.currentMedications || [];
    if (state.fields) Object.entries(state.fields).forEach(([key, value]) => setValue(key, value));
    if (state.chartState) {
      t = state.t || 0;
      chartState.labels = state.chartState.labels || [];
      chartState.datasets.forEach((ds, idx) => { ds.data = state.chartState.datasets?.[idx]?.data || []; });
      chart.update();
    }
  } catch (error) {
    console.error("Failed to load persisted state", error);
  }
}

function saveToDevice() {
  const blob = new Blob([JSON.stringify(gatherFormState(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "anes-monitoring-chart-state.json";
  link.click();
  URL.revokeObjectURL(url);
}

function exportCases() {
  const blob = new Blob([JSON.stringify(patients, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "anes-monitoring-cases.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importCasesPrompt() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (Array.isArray(imported)) {
          patients = imported;
          renderPatients();
          persistState();
        } else {
          alert("Imported file must contain an array of cases.");
        }
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
