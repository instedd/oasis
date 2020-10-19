export const fields = {
  CITY: {
    label: "City / Town",
    key: "city",
    initialValue: "",
  },
  STATE: {
    label: "State / Province",
    key: "state",
    initialValue: "",
  },
  COUNTRY: {
    label: "Country",
    key: "country",
    initialValue: "",
  },
  SICKNESSSTATUS: {
    label: "Are you sick?",
    key: "sicknessStatus",
    initialValue: "",
  },
  TESTEDSTATUS: {
    label: "Have you been tested for COVID-19?",
    key: "testedStatus",
    initialValue: "",
  },
};

export const initialFieldsState = () => {
  const entries = Object.values(fields).map((configs) => [
    configs.key,
    configs.initialValue,
  ]);
  return Object.fromEntries(entries);
};
