import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import api from "utils";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3RlNTE5IiwiYSI6ImNrOHc1aHlvYTB0N2ozam51MHFiazE3bmcifQ.AHtFuA-pAqau_AJIy-hzOg";

const countryMinZoom = 3.5;
const fillOutlineColor = "rgba(86, 101, 115, 0.5)";

const dataScope = {
  WORLD: "world",
  US_STATES: "us-states",
};

export default function Map({ draggable = true }) {
  const [state] = useState({
    lng: -119.6,
    lat: 36.7,
    zoom: 5,
  });

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [state.lng, state.lat],
      zoom: state.zoom,
    });

    const worldData = fetchCovidData(dataScope.WORLD);
    const usStatesData = fetchCovidData(dataScope.US_STATES);
    map.on("load", function () {
      addWorldLayer(map, worldData);
      addUSStatesLayer(map, usStatesData);
    });
  }, []);

  return (
    <div className={styles.root}>
      <div className={classNames(styles.fill)} id="map"></div>
      {!draggable && <div className={classNames(styles.fill, styles.mask)} />}
    </div>
  );
}

async function fetchCovidData(scope) {
  return await api(`data/${scope}`, {
    method: "GET",
  });
}

async function addWorldLayer(map, data) {
  const covidData = await data;
  const expression = covidData.map((row) => [row.country, getColor(row.group)]);

  map.addLayer(
    {
      id: "maine",
      type: "fill",
      layout: {},
      maxzoom: countryMinZoom,
      paint: {
        "fill-color": {
          type: "categorical",
          property: "name",
          stops: expression,
        },
        "fill-opacity": 0.7,
        "fill-outline-color": fillOutlineColor,
      },
      source: {
        type: "vector",
        url: "mapbox://saurabhp.countries_tileset",
      },
      "source-layer": "countries",
    },
    "waterway-label"
  );
}

function getColor(group) {
  return `rgba(${group * 255}, 0, 0, 1)`;
}

async function addUSStatesLayer(map, data) {
  const stateToFIPS = {
    AK: "02",
    AL: "01",
    AR: "05",
    AS: "60",
    AZ: "04",
    CA: "06",
    CO: "08",
    CT: "09",
    DC: "11",
    DE: "10",
    FL: "12",
    GA: "13",
    GU: "66",
    HI: "15",
    IA: "19",
    ID: "16",
    IL: "17",
    IN: "18",
    KS: "20",
    KY: "21",
    LA: "22",
    MA: "25",
    MD: "24",
    ME: "23",
    MI: "26",
    MN: "27",
    MO: "29",
    MS: "28",
    MT: "30",
    NC: "37",
    ND: "38",
    NE: "31",
    NH: "33",
    NJ: "34",
    NM: "35",
    NV: "32",
    NY: "36",
    OH: "39",
    OK: "40",
    OR: "41",
    PA: "42",
    PR: "72",
    RI: "44",
    SC: "45",
    SD: "46",
    TN: "47",
    TX: "48",
    UT: "49",
    VA: "51",
    VI: "78",
    VT: "50",
    WA: "53",
    WI: "55",
    WV: "54",
    WY: "56",
  };

  const usData = await data;
  // Add source for state polygons hosted on Mapbox, based on US Census Data:
  // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
  map.addSource("states", {
    type: "vector",
    url: "mapbox://mapbox.us_census_states_2015",
  });

  // exclude states outside the 50 states
  const expression = ["match", ["get", "STATE_ID"]];
  usData.forEach(function (row) {
    var stateID = row.state;
    if (stateID in stateToFIPS) {
      expression.push(stateToFIPS[stateID], getColor(row.group));
    }
  });
  expression.push("rgba(0,0,0,0)"); // Last value is the default, used where there is no data

  map.addLayer(
    {
      id: "states-join",
      type: "fill",
      source: "states",
      minzoom: countryMinZoom,
      // maxzoom: statesMinZoom,
      "source-layer": "states",
      paint: {
        "fill-color": expression,
        "fill-outline-color": fillOutlineColor,
      },
    },
    "waterway-label"
  );
}
