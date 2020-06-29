export const fields = {
  AGE: {
    label: "Age",
    key: "age",
    initialValue: null,
  },
  SEX: {
    label: "Sex",
    key: "sex",
    initialValue: null,
  },
  CITY: {
    label: "City",
    key: "city",
    initialValue: null,
  },
  COUNTRY: {
    label: "Country",
    key: "country",
    initialValue: "",
  },
  POSTAL_CODE: {
    label: "Postal code",
    key: "postalCode",
    initialValue: null,
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
  SICKNESS_START: {
    label: "When did you first start feeling sick?",
    key: "sicknessStart",
    initialValue: null,
  },
  SICKNESS_END: {
    label: "When did your illness resolve?",
    key: "sicknessEnd",
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
