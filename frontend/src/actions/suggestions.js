import { sicknessStatus, testStatus } from "routes/types";
import story from "reducers/story";

export const getStorySuggestions = (story) => {
  const suggestions = [
    {
      text: "Information for people in higher risk",
      site: peopleHigherRisk(story),
    },
    {
      text: "About COVID-19",
      site: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
    },
    {
      text: "Prevent getting sick",
      site: preventGettingSick(story),
    },
    {
      text: "Steps when sick",
      site: whenSick(story),
    },
    {
      text: "Testing for COVID-19",
      site:
        "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/testing.html",
    },
    {
      text: "More information about COVID-19",
      site: moreInfoAboutCovid(story),
    },
    {
      text: "Join a clinical trial",
      site: clinicalTrials(story),
    },
    {
      text: "ReliefCentral resources",
      site: "https://relief.unboundmedicine.com/relief",
    },
    {
      text: "Donate your blood to help others",
      site: donateBlood(story),
    },
    {
      text: "Information for US Citizens",
      site: informationForUSCitizens(story),
    },
    {
      text: "Information for US Travelers",
      site: informationForUSTravelers(story),
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
    predicate:
      story.currentLocation === countries.USA &&
      story.profession === "Healthcare",
    link: "https://heroesresearch.org",
  };

  return mostRelevant(story, [healthcare]);
};

const checkSymptoms = (story) => {
  const baseCondition = [
    sicknessStatus.RECOVERED,
    sicknessStatus.SICK,
  ].includes(story.sick);

  const isCurrentlyOnUS = {
    predicate: baseCondition && story.currentLocation === countries.USA,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
  };

  const isSickOrRecovered = {
    predicate: baseCondition,
    link: "https://landing.google.com/screener/covid19",
  };

  return mostRelevant(story, [isCurrentlyOnUS, isSickOrRecovered]);
};

const peopleHigherRisk = (story) => {
  const peopleAtRisk = {
    predicate: story.age > 64 || story.medicalConditions.length,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-at-higher-risk.html",
  };

  return mostRelevant(story, [peopleAtRisk]);
};

const donateBlood = (story) => {
  const testedRecovered = {
    predicate:
      story.sick === sicknessStatus.RECOVERED &&
      story.tested === testStatus.POSITIVE &&
      story.currentLocation === countries.USA,
    link:
      "https://www.redcrossblood.org/donate-blood/dlp/plasma-donations-from-recovered-covid-19-patients.html#donorform",
  };

  return mostRelevant(story, [testedRecovered]);
};

const informationForUSCitizens = (story) => {
  const usCitizenInMexico = {
    predicate:
      story.countryOfOrigin === countries.USA &&
      story.currentLocation === countries.MEX,
    link: "https://mx.usembassy.gov/u-s-citizen-services/covid-19-information/",
  };

  return mostRelevant(story, [usCitizenInMexico]);
};

const informationForUSTravelers = (story) => {
  const usCitizenAbroad = {
    predicate:
      story.countryOfOrigin === countries.USA &&
      ![countries.USA, countries.MEX].includes(story.currentLocation),
    link:
      "https://travel.state.gov/content/travel/en/international-travel/emergencies/what-state-dept-can-cant-do-crisis.html",
  };

  return mostRelevant(story, [usCitizenAbroad]);
};

const preventGettingSick = (story) => {
  const notSick = {
    predicate: story.sick === sicknessStatus.NOT_SICK,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/index.html",
  };
  return mostRelevant(story, [notSick]);
};

const whenSick = (story) => {
  const sick = {
    predicate: story.sick === sicknessStatus.SICK,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/steps-when-sick.html",
  };
  return mostRelevant(story, [sick]);
};

const moreInfoAboutCovid = (story) => {
  const moreAboutCovid = "https://www.cdc.gov/coronavirus/2019-nCoV/index.html";
  const currentlyOnUS = {
    predicate: story.currentLocation === countries.USA,
    link: moreAboutCovid,
  };
  const usCitizen = {
    predicate: story.countryOfOrigin === countries.USA,
    link: moreAboutCovid,
  };
  return mostRelevant(story, [currentlyOnUS, usCitizen]);
};

const mostRelevantOrElse = (story, options) => (defaultLink) => {
  return mostRelevant(story, options) || defaultLink;
};

const mostRelevant = (story, options) => {
  const option = story && options.find((op) => op.predicate);
  return option && option.link;
};

const countries = {
  USA: "United States of America",
  MEX: "Mexico",
};
