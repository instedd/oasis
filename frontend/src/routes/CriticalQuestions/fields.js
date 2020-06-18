export const fields = {
  AGE: {
    label: "Age",
    name: "age",
    initialValue: null,
  },
  SEX: {
    label: "Sex",
    name: "sex",
    initialValue: null,
  },
  ETHNICITY: {
    label: "Ethnicity",
    name: "ethnicity",
    initialValue: "",
  },
  CURRENT_LOCATION: {
    label: "Current location",
    name: "currentLocation",
    initialValue: "",
  },
  POSTAL_CODE: {
    label: "Postal code",
    name: "postalCode",
    initialValue: null,
  },
  COUNTRY_OF_ORIGIN: {
    label: "Citizenship",
    name: "countryOfOrigin",
    initialValue: "",
  },
  PROFESSION: {
    label: "Profession",
    name: "profession",
    initialValue: "",
  },
  MEDICAL_CONDITIONS: {
    label: "Medical conditions",
    name: "medicalConditions",
    initialValue: [],
  },
  SICKNESS_START: {
    label: "When did you first start feeling sick?",
    name: "sicknessStart",
    initialValue: null,
  },
  SICKNESS_END: {
    label: "When did your illness resolve?",
    name: "sicknessEnd",
    initialValue: null,
  },
};

export const initialFieldsState = () => {
  const state = {};
  for (const configs of Object.values(fields)) {
    state[configs.name] = configs.initialValue;
  }
  return state;
};
