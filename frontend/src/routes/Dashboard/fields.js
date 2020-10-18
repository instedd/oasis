export const fields = {
  AGE: {
    label: "Age",
    key: "age",
    initialValue: "null",
  },
  SEX: {
    label: "Sex",
    key: "sex",
    initialValue: "",
  },
  COUNTRY_OF_ORIGIN: {
    label: "Citizenship",
    key: "countryOfOrigin",
    initialValue: "",
  },
  PROFESSION: {
    label: "Profession",
    key: "profession",
    initialValue: "",
  },
  MEDICAL_CONDITIONS: {
    label: "Medical conditions",
    key: "medicalConditions",
    initialValue: [],
  },
};

export const initialFieldsState = () => {
  const entries = Object.values(fields).map((configs) => [
    configs.key,
    configs.initialValue,
  ]);
  return Object.fromEntries(entries);
};
