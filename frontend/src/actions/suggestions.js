import { sicknessStatus, testStatus } from "routes/types";

export const getStorySuggestions = (story) => {
  const suggestions = [
    {
      text: "Information for people in higher risk",
      site: peopleHigherRisk(story),
    },
    {
      text: "Download HomeBound",
      site: homebound(story),
    },
    {
      text: "Join a clinical trial",
      site: clinicalTrials(story),
    },
    {
      text: "Donate your blood to help others",
      site: donateBlood(story),
    },
    {
      text: "More information about COVID-19",
      site: "https://coronavirus.gov",
    },
    {
      text: "Information for US Citizens",
      site: informationForUSCitizens(story),
    },
    {
      text: "Check your symptoms",
      site: checkSymptoms(story),
    },
  ];
  // Only keep the suggestions that matched the requirements, thus, the site is present
  return suggestions.filter((suggestion) => Boolean(suggestion.site));
};

const clinicalTrials = (story) => {
  const healthcare = {
    predicate: story.profession === "Healthcare",
    link: "https://heroesresearch.org",
  };
  const usLocation = {
    predicate: story.currentLocation === "United States of America",
    link:
      "https://www.niaid.nih.gov/diseases-conditions/covid-19-clinical-research",
  };

  return mostRelevantOrElse(story, [healthcare, usLocation])(
    "https://clinicaltrials.gov/ct2/who_table"
  );
};

const checkSymptoms = (story) => {
  const baseCondition =
    story.sick in [sicknessStatus.RECOVERED, sicknessStatus.SICK];

  const isCurrentlyOnUS = {
    predicate:
      baseCondition && story.currentLocation === "United States of America",
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
  };

  return mostRelevantOrElse(story, [isCurrentlyOnUS])(
    "https://landing.google.com/screener/covid19"
  );
};

const peopleHigherRisk = (story) => {
  const peopleAtRisk = {
    predicate: story.age > 64 || story.medicalConditions.length,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-at-higher-risk.html",
  };

  return mostRelevant(story, [peopleAtRisk]);
};

const homebound = (story) => {
  const sick = {
    predicate: story.sick === sicknessStatus.SICK,
    link: "https://earth2-covid.ucsd.edu/homebound",
  };

  return mostRelevant(story, [sick]);
};

const donateBlood = (story) => {
  const testedRecovered = {
    predicate:
      story.sick === sicknessStatus.RECOVERED &&
      story.tested === testStatus.POSITIVE,
    link:
      "https://www.redcrossblood.org/donate-blood/dlp/plasma-donations-from-recovered-covid-19-patients.html#donorform",
  };

  return mostRelevant(story, [testedRecovered]);
};

const informationForUSCitizens = (story) => {
  const baseCondition = story.countryOfOrigin === "United States of America";

  const citizenInMexico = {
    predicate: baseCondition && story.currentLocation === "Mexico",
    link: "https://mx.usembassy.gov/u-s-citizen-services/covid-19-information/",
  };
  const citizenAbroad = {
    predicate:
      baseCondition && story.currentLocation !== "United States of America",
    link:
      "https://travel.state.gov/content/travel/en/international-travel/emergencies/what-state-dept-can-cant-do-crisis.html",
  };

  return mostRelevant(story, [citizenInMexico, citizenAbroad]);
};

const mostRelevantOrElse = (story, options) => (defaultLink) => {
  return mostRelevant(story, options) || defaultLink;
};

const mostRelevant = (story, options) => {
  const option = story && options.find((op) => op.predicate);
  return option && option.link;
};
