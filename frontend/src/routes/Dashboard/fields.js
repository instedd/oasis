export const fields = {
  AGE: {
    label: "Age",
    key: "age",
    initialValue: undefined,
  },
  SEX: {
    label: "Sex",
    key: "sex",
    initialValue: undefined,
  },
  COUNTRY_OF_ORIGIN: {
    label: "Citizenship",
    key: "countryOfOrigin",
    initialValue: undefined,
  },
  PROFESSION: {
    label: "Profession",
    key: "profession",
    initialValue: undefined,
  },
  MEDICAL_CONDITIONS: {
    label: "Medical conditions",
    key: "medicalConditions",
    initialValue: [],
  },
  SICKNESS: {
    lable: "Are you sick?",
    key: "sickness",
    initialValue: undefined,
  },
  TESTED: {
    lable: "Have you been tested for COVID-19?",
    key: "tested",
    initialValue: undefined,
  },
};

export const initialFieldsState = () => {
  const entries = Object.values(fields).map((configs) => [
    configs.key,
    configs.initialValue,
  ]);
  return Object.fromEntries(entries);
};
