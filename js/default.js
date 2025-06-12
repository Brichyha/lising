const defaultData = {
  nds: 20,
  redemptionPercent: 1,
};

const constantsConditionActions = {
  percent: "percent",
  term: "term",
  payment: "payment",
};

const getLocalStorage = (name) => {
  return JSON.parse(localStorage.getItem(name));
};
const setLocalStorage = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
  return "all ok";
};
