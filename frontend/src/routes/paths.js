import { sicknessStatus } from "routes/types";

const paths = {
  home: "/",
  signIn: "/signin",
  signUp: "/signup",
  onboard: "/onboard",
  alert: "/alert",
  criticalQuestions: "/questions",
  symptoms: "/symptoms",
  dashboard: "/dashboard",
  confirm: "/confirm",
  healthMeasurements: "/measurements",
  myStory: "/mystory",
  consent: "/consent",
};

export const getConfirmFlow = (state, sickness) => {
  if (!state || state.onboard === false) return paths.criticalQuestions;
  if (sickness === sicknessStatus.SICK) return paths.symptoms;
  return paths.dashboard;
};

export default paths;
