export const fields = {
  CITY: {
    label: "City / Town",
    key: "city",
    initialValue: null,
  },
  STATE: {
    label: "State / Province",
    key: "state",
    initialValue: null,
  },
  COUNTRY: {
    label: "Country",
    key: "country",
    initialValue: null,
  },
  SICKNESSSTATUS: {
    label: "Are you sick?",
    key: "sick",
    initialValue: null,
  },
  TESTEDSTATUS: {
    label: "Have you been tested for COVID-19?",
    key: "tested",
    initialValue: null,
  },
};

export const initialFieldsState = () => {
  const entries = Object.values(fields).map((configs) => [
    configs.key,
    configs.initialValue,
  ]);
  return Object.fromEntries(entries);
};
