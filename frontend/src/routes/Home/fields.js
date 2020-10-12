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
};

export const initialFieldsState = () => {
  const entries = Object.values(fields).map((configs) => [
    configs.key,
    configs.initialValue,
  ]);
  return Object.fromEntries(entries);
};
