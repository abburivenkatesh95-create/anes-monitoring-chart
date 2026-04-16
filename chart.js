let t = 0;

const chartState = {
  labels: [],
  datasets: [
    { label: "HR", data: [], borderColor: "#ef4444", backgroundColor: "#ef4444", pointStyle: "circle", pointRadius: 6, borderWidth: 2, borderDash: [], yAxisID: "y" },
    { label: "SpO2", data: [], borderColor: "#22c55e", backgroundColor: "#22c55e", pointStyle: "triangle", pointRadius: 7, borderWidth: 2, borderDash: [6,4], yAxisID: "y1" },
    { label: "ETCO2", data: [], borderColor: "#f97316", backgroundColor: "#f97316", pointStyle: "rectRot", pointRadius: 7, borderWidth: 2, borderDash: [2,3], yAxisID: "y" },
    { label: "Resp Rate", data: [], borderColor: "#8b5cf6", backgroundColor: "#8b5cf6", pointStyle: "crossRot", pointRadius: 7, borderWidth: 2, borderDash: [3,2], yAxisID: "y" },
    { label: "SBP", data: [], borderColor: "#06b6d4", backgroundColor: "#06b6d4", pointStyle: "rect", pointRadius: 6, borderWidth: 2, borderDash: [10,5,2,5], yAxisID: "y" },
    { label: "DBP", data: [], borderColor: "#3b82f6", backgroundColor: "#3b82f6", pointStyle: "cross", pointRadius: 7, borderWidth: 2, borderDash: [1,3], yAxisID: "y" },
    { label: "MAP", data: [], borderColor: "#eab308", backgroundColor: "#eab308", pointStyle: "star", pointRadius: 8, borderWidth: 3, borderDash: [], yAxisID: "y" },
    { label: "Temp", data: [], borderColor: "#ec4899", backgroundColor: "#ec4899", pointStyle: "rectRounded", pointRadius: 7, borderWidth: 2, borderDash: [4,2], yAxisID: "y1" },
    { label: "O2 Flow", data: [], borderColor: "#14b8a6", backgroundColor: "#14b8a6", pointStyle: "line", pointRadius: 6, borderWidth: 2, borderDash: [8,4], yAxisID: "y2" },
    { label: "Iso/Sevo", data: [], borderColor: "#f43f5e", backgroundColor: "#f43f5e", pointStyle: "crossRot", pointRadius: 7, borderWidth: 2, borderDash: [12,6], yAxisID: "y2" }
  ]
};

const chart = new Chart(el("chart"), {
  type: "line",
  data: chartState,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: "#111827",
          boxWidth: 14
        }
      }
    },
    elements: { line: { tension: 0.28 } },
    scales: {
      x: {
        ticks: { color: "#111827" },
        grid: { color: "rgba(17,24,39,0.10)" }
      },
      y: {
        type: "linear",
        position: "left",
        min: 0,
        max: 200,
        ticks: { color: "#111827" },
        grid: { color: "#d1d5db" }
      },
      y1: {
        type: "linear",
        position: "right",
        min: 30,
        max: 100,
        ticks: { color: "#111827" },
        grid: { drawOnChartArea: false }
      },
      y2: {
        type: "linear",
        position: "right",
        min: 0,
        max: 10,
        offset: true,
        ticks: { color: "#111827" },
        grid: { drawOnChartArea: false }
      }
    }
  }
});

function addData() {
  t += 1;
  const startVal = getValue("astart");
  let label = `T${t}`;
  if (startVal) {
    const start = new Date(startVal);
    const current = new Date(start.getTime() + (t - 1) * 5 * 60000);
    label = formatTime(current);
  }
  chartState.labels.push(label);

  const ids = ["hr", "spo2", "etco2", "rr", "sbp", "dbp", "map", "temp", "o2flow", "vaporizer"];
  ids.forEach((id, idx) => {
    const value = getNumber(id);
    chartState.datasets[idx].data.push(value !== null ? value : null);
  });

  ["hr", "spo2", "etco2", "map"].forEach(id => {
    const liveNode = el(`live_${id}`);
    if (liveNode) liveNode.textContent = getValue(id) || "--";
  });

  previewAlarms();
  chart.update();
  persistState();
}

function clearData() {
  t = 0;
  chartState.labels = [];
  chartState.datasets.forEach(ds => { ds.data = []; });
  chart.update();
  persistState();
}
