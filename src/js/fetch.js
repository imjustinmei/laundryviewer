const transpose = (a) => {
  return a[0].map(function (_, c) {
    return a.map(function (r) {
      return r[c];
    });
  });
};

const parseFile = async (file) => {
  return new Promise((resolve) => {
    let rows = [];
    Papa.parse(file, {
      dynamicTyping: true,
      skipEmptyLines: false,
      worker: true,
      chunkSize: 1000,
      chunk: (res) => {
        rows.push(...res.data);
      },
      complete: () => {
        rows = transpose(rows);
        resolve(rows);
      },
    });
  });
};

const getData = async (week) => {
  const url = "https://raw.githubusercontent.com/imjustinmei/laundryviewer/refs/heads/main/data/";

  const response = await fetch(url + week + ".csv").catch((err) => console.error(err));

  const file = await response.text();
  const entry = await parseFile(file);

  for (const field of [0, 1, 4]) {
    entry[field] = entry[field].map((x) => {
      if (x == null) return null;
      return x / 10;
    });
  }

  dataset[week] = entry;
};
