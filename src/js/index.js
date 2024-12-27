const toWeek = (day) => {
  return (day / 7) | 0;
};

const toDateString = (date) => {
  return date.toISOString().split("T")[0];
};

const getSlice = (index) => {
  const week = toWeek(index);
  const day = index % 7;
  const data = dataset[week];

  return data.map((entry) => entry.slice(6 * dataWidth * day, 6 * dataWidth * (day + 1)));
};

const updateChart = (chart) => {
  const data = getSlice(offset);
  for (let i = 0; i < 5; i++) {
    chart.data.datasets[i].data = data[i];
  }

  chart.update();
};

const updateArrows = () => {
  for (const element of ["start", "end"]) {
    const navArrow = document.getElementById(element);
    if (element == "start") navArrow.classList.toggle("disabled", offset == 0);
    else navArrow.classList.toggle("disabled", offset == dataMax);
  }

  for (const element of ["back", "forward"]) {
    const navArrow = document.getElementById(element);
    const direction = +navArrow.dataset.increment;

    if (element == "back") navArrow.classList.toggle("disabled", offset + direction == -1);
    else navArrow.classList.toggle("disabled", offset + direction > dataMax);
  }
};

const updateState = async (chart, offset) => {
  const newDate = new Date(epoch);
  newDate.setUTCDate(newDate.getUTCDate() + offset);
  date.innerText = toDateString(newDate);

  const week = toWeek(offset);
  if (!(week in dataset)) await getData(week);

  updateChart(chart);
  updateArrows();
};
