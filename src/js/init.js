let offset = 0;
let maxIndex = 0;
let dataMax = 0;
let missing = [];

const dataset = {};
const dataWidth = 240;
const date = document.getElementById("date");
const epoch = new Date("2024-10-19T05:00:00Z");
const max = Math.floor((new Date() - epoch) / 86400000);

const times = Array.from(
  { length: 1440 },
  (_, i) =>
    `${String(Math.floor(i / 60) % 12 || 12).padStart(2, "0")}:${String(i % 60).padStart(2, "0")} ${
      i >= 720 ? "PM" : "AM"
    }`
);

const initializeChart = () => {
  const ctx = document.getElementById("chart").getContext("2d");

  const data = {
    labels: times,
    datasets: [
      {
        label: "Washer",
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        hoverBackgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.3,
        clip: 0,
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 5,
        yAxisID: "y",
      },
      {
        label: "Dryer",
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.3,
        clip: 0,
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 5,
        yAxisID: "y",
      },
      {
        hidden: true,
      },
      {
        hidden: true,
      },
      {
        hidden: true,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: "chartArea",
          labels: {
            filter: (item) => {
              return !!item.text;
            },
          },
        },
        tooltip: {
          mode: "index",
          intersect: "false",
          callbacks: {
            label: (ctx) => {
              const machines = ctx.chart.data.datasets[ctx.datasetIndex + 2].data[ctx.dataIndex];
              return [
                `${ctx.raw}%`,
                `${machines} ${(ctx.datasetIndex == 0 ? "washer" : "dryer") + (machines == 1 ? "" : "s")}`,
              ];
            },
            afterBody: (ctx) => {
              const context = ctx[0];
              return `${context.chart.data.datasets[4].data[context.dataIndex]} minutes`;
            },
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: "false",
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 8,
          },
        },
        y: {
          max: 100,
          beginAtZero: true,
          title: {
            display: true,
            text: "Utilization (%)",
          },
        },
      },
    },
  };

  return new Chart(ctx, config);
};

const initialize = () => {
  const chart = initializeChart();

  if (maxIndex % 2 == 0) offset = dataMax;
  else offset = max;

  for (const element of ["start", "end"]) {
    const navArrow = document.getElementById(element);
    navArrow.addEventListener("click", () => {
      const change = +navArrow.dataset.change;

      offset = change * dataMax;
      updateState(chart, offset);
    });
  }

  for (const element of ["back", "forward"]) {
    const navArrow = document.getElementById(element);
    navArrow.addEventListener("click", async () => {
      const direction = +navArrow.dataset.increment;
      let updated = offset + direction;

      if (updated < 0 || updated > dataMax) return;
      if (missing.includes(updated)) updated = missing[missing.indexOf(updated) + direction] + direction;

      offset = updated;

      updateState(chart, offset);
    });
  }

  getData(toWeek(offset)).then(() => {
    updateState(chart, offset);
  });
};

(async () => {
  const url = "https://raw.githubusercontent.com/imjustinmei/laundryviewer/refs/heads/main/data/missing.json";
  const response = await fetch(url).catch((err) => console.error(err));
  missing = await response.json();
  maxIndex = missing.reduce((a, c, i) => (c < max ? i : a), 0);
  dataMax = missing[maxIndex] - 1;
  initialize();
})();
