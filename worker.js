

function filterByType(data, type) {
  const types = data.map((el) => el[type]);
  const result = Array.from(new Set(types));
  return result;
}

function search(data, key) {
  const result = [];
  data.forEach((element) => {
    if (element.name.toLowerCase().includes(key.toLowerCase())) {
      result.push(element);
    }
  });
  return result;
}

const actions = {
  filterByType,
  search,
};

onmessage = (evt) => {
  const func = evt.data.functionName;
  const params = evt.data.params;
  const result = actions[func](...params);

  postMessage({ result, target: func });
};
