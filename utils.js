function el(id) { return document.getElementById(id); }
function getValue(id) { const node = el(id); return node ? node.value : ""; }
function setValue(id, value) { const node = el(id); if (node) node.value = value ?? ""; }
function getNumber(id) { const value = parseFloat(getValue(id)); return Number.isFinite(value) ? value : null; }
function getWeight() { return getNumber("pweight"); }
function getSpeciesKey() {
  const raw = getValue("ptype").toLowerCase();
  if (raw.includes("canine")) return "canine";
  if (raw.includes("feline")) return "feline";
  return "other";
}
function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
