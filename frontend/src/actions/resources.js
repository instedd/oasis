import { sicknessStatus, testStatus } from "routes/types";

export const getStoryResources = (story) => {
  const resources = [
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
      text: "More about COVID-19",
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
    {
      text: "COVID-19 in California",
      site: covidCali(story),
    },
    {
      text: "Updates in Baja",
      site: bajaUpdate(story),
    },
    {
      text: "Testing in California",
      site: testCali(story),
    },
  ];

  // Only keep the resources that matched the requirements, thus, the site is present
  return resources.filter((resource) => Boolean(resource.site));
};

const withStory = (storyDependantFunc) => (story) =>
  story && storyDependantFunc(story);

const clinicalTrials = withStory((story) => {
  const healthcare = {
    predicate:
      (story.country === countries.USA || story.country === countries.US) &&
      story.profession === "Healthcare",
    link: "https://heroesresearch.org",
  };

  return mostRelevant([healthcare]);
});

const checkSymptoms = withStory((story) => {
  const baseCondition = [
    sicknessStatus.RECOVERED,
    sicknessStatus.SICK,
  ].includes(story.sick);

  const isCurrentlyOnUS = {
    predicate:
      baseCondition &&
      (story.country === countries.USA || story.country === countries.US),
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
  };

  const isSickOrRecovered = {
    predicate: baseCondition,
    link: "https://landing.google.com/screener/covid19",
  };

  return mostRelevant([isCurrentlyOnUS, isSickOrRecovered]);
});

const peopleHigherRisk = withStory((story) => {
  const peopleAtRisk = {
    predicate: story.age > 64 || story.medicalConditions.length,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-at-higher-risk.html",
  };

  return mostRelevant([peopleAtRisk]);
});

const donateBlood = withStory((story) => {
  const testedRecovered = {
    predicate:
      story.sick === sicknessStatus.RECOVERED &&
      story.tested === testStatus.POSITIVE &&
      (story.country === countries.USA || story.country === countries.US),
    link:
      "https://www.redcrossblood.org/donate-blood/dlp/plasma-donations-from-recovered-covid-19-patients.html#donorform",
  };

  return mostRelevant([testedRecovered]);
});

const covidCali = withStory((story) => {
  const checkCali = {
    predicate: story.state === states.CAL && story.country === countries.USA,
    link: "https://covid19.ca.gov/",
  };

  return mostRelevant([checkCali]);
});

const bajaUpdate = withStory((story) => {
  const checkBaja = {
    predicate: story.state === states.BAJA && story.country === countries.MEX,
    link: "http://www.bajacalifornia.gob.mx/coronavirus?id=1",
  };

  return mostRelevant([checkBaja]);
});

const testCali = withStory((story) => {
  const checkState = {
    predicate:
      (story.state === states.BAJA && story.country === countries.MEX) ||
      (story.state === states.CAL &&
        (story.country == countries.USA || story.country === countries.US)),
    link: "https://covid19.ca.gov/testing-and-treatment/",
  };

  return mostRelevant([checkState]);
});

const informationForUSCitizens = withStory((story) => {
  const usCitizenInMexico = {
    predicate:
      story.countryOfOrigin === countries.USA &&
      story.country === countries.MEX,
    link: "https://mx.usembassy.gov/u-s-citizen-services/covid-19-information/",
  };

  return mostRelevant([usCitizenInMexico]);
});

const informationForUSTravelers = withStory((story) => {
  const usCitizenAbroad = {
    predicate:
      (story.countryOfOrigin === countries.USA ||
        story.countryOfOrigin === countries.US) &&
      ![countries.USA, countries.MEX, countries.US].includes(story.country),
    link:
      "https://travel.state.gov/content/travel/en/traveladvisories/ea/covid-19-information.html",
  };

  return mostRelevant([usCitizenAbroad]);
});

const preventGettingSick = withStory((story) => {
  const notSick = {
    predicate: story.sick === sicknessStatus.NOT_SICK,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/index.html",
  };
  return mostRelevant([notSick]);
});

const whenSick = withStory((story) => {
  const sick = {
    predicate: story.sick === sicknessStatus.SICK,
    link:
      "https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/steps-when-sick.html",
  };
  return mostRelevant([sick]);
});

const moreInfoAboutCovid = withStory((story) => {
  const moreAboutCovid = "https://www.cdc.gov/coronavirus/2019-nCoV/index.html";
  const currentlyOnUS = {
    predicate:
      story.country === countries.USA || story.country === countries.US,
    link: moreAboutCovid,
  };
  const usCitizen = {
    predicate:
      story.countryOfOrigin === countries.USA ||
      story.countryOfOrigin === countries.US,
    link: moreAboutCovid,
  };
  return mostRelevant([currentlyOnUS, usCitizen]);
});

const mostRelevant = (options) => {
  const option = options.find((op) => op.predicate);
  return option && option.link;
};

const countries = {
  USA: "United States of America",
  US: "United States",
  MEX: "Mexico",
};

const states = {
  CAL: "California",
  BAJA: "Baja",
};
