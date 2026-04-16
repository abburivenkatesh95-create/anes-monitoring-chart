function getMidDose(range) { return (range.low + range.high) / 2; }

function updateFluidCalculator() {
  const weight = getWeight();
  const ratePerKg = getNumber("fluidRatePerKg");
  const hours = getNumber("fluidHours");
  const bolusRate = getNumber("bolusRate");
  const gtt = getNumber("gttFactor");
  const species = getSpeciesKey();

  const totalRate = (weight !== null && ratePerKg !== null) ? weight * ratePerKg : null;
  const totalVolume = (totalRate !== null && hours !== null) ? totalRate * hours : null;
  const bolusTotal = (weight !== null && bolusRate !== null) ? weight * bolusRate : null;
  const shockFactor = species === "canine" ? 90 : (species === "feline" ? 60 : 70);
  const shockTotal = weight !== null ? weight * shockFactor : null;
  const dripRate = (totalRate !== null && gtt !== null && gtt > 0) ? (totalRate * gtt) / 60 : null;

  setValue("fluidTotalRate", totalRate !== null ? `${totalRate.toFixed(2)} mL/hr` : "");
  setValue("fluidTotalVolume", totalVolume !== null ? `${totalVolume.toFixed(2)} mL` : "");
  setValue("bolusTotal", bolusTotal !== null ? `${bolusTotal.toFixed(2)} mL` : "");
  setValue("shockDoseTotal", shockTotal !== null ? `${shockTotal.toFixed(2)} mL` : "");
  setValue("dripOut", dripRate !== null ? `${Math.round(dripRate)} gtt/min` : "");
}

function evaluateParam(name, value) {
  if (!Number.isFinite(value)) return { level: "good", message: `${name}: no value` };
  switch (name) {
    case "hr":
      if (value < 50 || value > 180) return { level: "danger", message: `HR ${value}` };
      if (value < 60 || value > 160) return { level: "warn", message: `HR ${value}` };
      return { level: "good", message: `HR ${value}` };
    case "spo2":
      if (value < 90) return { level: "danger", message: `SpO₂ ${value}%` };
      if (value < 95) return { level: "warn", message: `SpO₂ ${value}%` };
      return { level: "good", message: `SpO₂ ${value}%` };
    case "etco2":
      if (value < 25 || value > 60) return { level: "danger", message: `ETCO₂ ${value}` };
      if (value < 30 || value > 55) return { level: "warn", message: `ETCO₂ ${value}` };
      return { level: "good", message: `ETCO₂ ${value}` };
    case "rr":
      if (value < 4 || value > 60) return { level: "danger", message: `RR ${value}` };
      if (value < 6 || value > 40) return { level: "warn", message: `RR ${value}` };
      return { level: "good", message: `RR ${value}` };
    case "map":
      if (value < 55 || value > 130) return { level: "danger", message: `MAP ${value}` };
      if (value < 60 || value > 120) return { level: "warn", message: `MAP ${value}` };
      return { level: "good", message: `MAP ${value}` };
    case "temp":
      if (value < 35 || value > 40.5) return { level: "danger", message: `Temp ${value}` };
      if (value < 36 || value > 39.8) return { level: "warn", message: `Temp ${value}` };
      return { level: "good", message: `Temp ${value}` };
    default:
      return { level: "good", message: `${name} ${value}` };
  }
}

function alarmClass(level) {
  if (level === "danger") return "alarm-danger";
  if (level === "warn") return "alarm-warn";
  return "alarm-good";
}
function alarmTextClass(level) {
  if (level === "danger") return "alarm-text-danger";
  if (level === "warn") return "alarm-text-warn";
  return "alarm-text-good";
}
function applyAlarmBox(boxId, result, valueId) {
  const box = el(boxId);
  const valueNode = el(valueId);
  if (!box || !valueNode) return;
  box.classList.remove("alarm-good", "alarm-warn", "alarm-danger");
  valueNode.classList.remove("alarm-text-good", "alarm-text-warn", "alarm-text-danger");
  box.classList.add(alarmClass(result.level));
  valueNode.classList.add(alarmTextClass(result.level));
}
function previewAlarms() {
  const hr = getNumber("hr");
  const spo2 = getNumber("spo2");
  const etco2 = getNumber("etco2");
  const rr = getNumber("rr");
  const map = getNumber("map");
  const temp = getNumber("temp");

  const results = {
    hr: evaluateParam("hr", hr),
    spo2: evaluateParam("spo2", spo2),
    etco2: evaluateParam("etco2", etco2),
    rr: evaluateParam("rr", rr),
    map: evaluateParam("map", map),
    temp: evaluateParam("temp", temp)
  };

  applyAlarmBox("box_hr", results.hr, "live_hr");
  applyAlarmBox("box_spo2", results.spo2, "live_spo2");
  applyAlarmBox("box_etco2", results.etco2, "live_etco2");
  applyAlarmBox("box_map", results.map, "live_map");

  const summary = Object.values(results).filter(result => result.level !== "good").map(result => result.message);
  el("alarmSummary").textContent = summary.length ? summary.join(" • ") : "All previewed values are within the default ranges.";
}

function getEmergencyDoseResult(drug, weight, concentration) {
  let totalDose = null;
  let totalMl = null;
  let displayUnit = drug.unit || "mg";
  if (weight !== null && concentration !== null && concentration > 0) {
    if (drug.unit === "mcg/kg") {
      totalDose = weight * drug.dose;
      totalMl = (totalDose / 1000) / concentration;
      displayUnit = "mcg";
    } else if (drug.unit === "U/kg") {
      totalDose = weight * drug.dose;
      totalMl = totalDose / concentration;
      displayUnit = "U";
    } else {
      totalDose = weight * drug.dose;
      totalMl = totalDose / concentration;
      displayUnit = "mg";
    }
  }
  return { totalDose, totalMl, displayUnit };
}
