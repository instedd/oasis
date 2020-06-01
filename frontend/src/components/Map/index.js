import chroma from "chroma-js";
import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";


mapboxgl.accessToken =
  "pk.eyJ1Ijoic3RlNTE5IiwiYSI6ImNrOHc1aHlvYTB0N2ozam51MHFiazE3bmcifQ.AHtFuA-pAqau_AJIy-hzOg";

export default function Map() {
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

    var data = {};
    const url = "https://covidtracking.com/api/states";
    fetch(url)
      .then((resp) => resp.json())
      .then(function (dat) {
        data = dat;
      })
      .catch(function (error) {
        console.log(error);
      });

    map.on("load", function () {
      // Add source for state polygons hosted on Mapbox, based on US Census Data:
      // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
      map.addSource("states", {
        type: "vector",
        url: "mapbox://mapbox.us_census_states_2015",
      });

      // exclude states outside the 50 states
      const expression = ["match", ["get", "STATE_ID"]];
      // var maxValue= data.reduce((max,b) => Math.max(max, b.death), data[0].death);
      const normalizerValue = 5000;
      data.forEach(function (row) {
        var stateID = row.state;
        if (stateID in stateToFIPS) {
          var red = (row.death / normalizerValue) * 255;
          var color = "rgba(" + red + ", " + 0 + ", " + 0 + ", 1)";
          expression.push(stateToFIPS[stateID], color);
        }
      });

      // Last value is the default, used where there is no data
      expression.push("rgba(0,0,0,0)");

      const zoomThreshold = 4;
      // Add layer from the vector tile source with data-driven style
      map.addLayer(
        {
          id: "states-join",
          type: "fill",
          source: "states",
          maxzoom: zoomThreshold,
          "source-layer": "states",
          paint: {
            "fill-color": expression,
          },
        }
        // 'road-label'
      );

      /*----------------------------  County Level Data ----------------------------------*/

      // var countyData ={}
      // var url ="http://13.57.220.143/getcounty";
      // fetch(url,{ method: 'post'}).then((resp) => resp.json())
      //   .then(function(data) {
      //     countyData=data;
      //     console.log(data);
      //   })
      //   .catch(function(error) {
      //     console.log(error);
      //   });
      // TODO: I need help making this URL fetch work

      const countyData = [
        {
          deaths: 69,
          county: "Alameda",
          state: "California",
          fips: "06001",
          date: "2020-05-06",
          cases: 1884,
        },
        {
          deaths: 0,
          county: "Alpine",
          state: "California",
          fips: "06003",
          date: "2020-05-06",
          cases: 2,
        },
        {
          deaths: 0,
          county: "Amador",
          state: "California",
          fips: "06005",
          date: "2020-05-06",
          cases: 7,
        },
        {
          deaths: 0,
          county: "Butte",
          state: "California",
          fips: "06007",
          date: "2020-05-06",
          cases: 19,
        },
        {
          deaths: 0,
          county: "Calaveras",
          state: "California",
          fips: "06009",
          date: "2020-05-06",
          cases: 13,
        },
        {
          deaths: 0,
          county: "Colusa",
          state: "California",
          fips: "06011",
          date: "2020-05-06",
          cases: 3,
        },
        {
          deaths: 29,
          county: "Contra Costa",
          state: "California",
          fips: "06013",
          date: "2020-05-06",
          cases: 985,
        },
        {
          deaths: 0,
          county: "Del Norte",
          state: "California",
          fips: "06015",
          date: "2020-05-06",
          cases: 3,
        },
        {
          deaths: 0,
          county: "El Dorado",
          state: "California",
          fips: "06017",
          date: "2020-05-06",
          cases: 54,
        },
        {
          deaths: 9,
          county: "Fresno",
          state: "California",
          fips: "06019",
          date: "2020-05-06",
          cases: 777,
        },
        {
          deaths: 0,
          county: "Glenn",
          state: "California",
          fips: "06021",
          date: "2020-05-06",
          cases: 5,
        },
        {
          deaths: 0,
          county: "Humboldt",
          state: "California",
          fips: "06023",
          date: "2020-05-06",
          cases: 55,
        },
        {
          deaths: 8,
          county: "Imperial",
          state: "California",
          fips: "06025",
          date: "2020-05-06",
          cases: 419,
        },
        {
          deaths: 1,
          county: "Inyo",
          state: "California",
          fips: "06027",
          date: "2020-05-06",
          cases: 20,
        },
        {
          deaths: 11,
          county: "Kern",
          state: "California",
          fips: "06029",
          date: "2020-05-06",
          cases: 1084,
        },
        {
          deaths: 1,
          county: "Kings",
          state: "California",
          fips: "06031",
          date: "2020-05-06",
          cases: 233,
        },
        {
          deaths: 0,
          county: "Lake",
          state: "California",
          fips: "06033",
          date: "2020-05-06",
          cases: 8,
        },
        {
          deaths: 1367,
          county: "Los Angeles",
          state: "California",
          fips: "06037",
          date: "2020-05-06",
          cases: 28644,
        },
        {
          deaths: 2,
          county: "Madera",
          state: "California",
          fips: "06039",
          date: "2020-05-06",
          cases: 55,
        },
        {
          deaths: 14,
          county: "Marin",
          state: "California",
          fips: "06041",
          date: "2020-05-06",
          cases: 244,
        },
        {
          deaths: 0,
          county: "Mariposa",
          state: "California",
          fips: "06043",
          date: "2020-05-06",
          cases: 15,
        },
        {
          deaths: 0,
          county: "Mendocino",
          state: "California",
          fips: "06045",
          date: "2020-05-06",
          cases: 40,
        },
        {
          deaths: 3,
          county: "Merced",
          state: "California",
          fips: "06047",
          date: "2020-05-06",
          cases: 152,
        },
        {
          deaths: 1,
          county: "Mono",
          state: "California",
          fips: "06051",
          date: "2020-05-06",
          cases: 27,
        },
        {
          deaths: 6,
          county: "Monterey",
          state: "California",
          fips: "06053",
          date: "2020-05-06",
          cases: 240,
        },
        {
          deaths: 2,
          county: "Napa",
          state: "California",
          fips: "06055",
          date: "2020-05-06",
          cases: 79,
        },
        {
          deaths: 1,
          county: "Nevada",
          state: "California",
          fips: "06057",
          date: "2020-05-06",
          cases: 41,
        },
        {
          deaths: 65,
          county: "Orange",
          state: "California",
          fips: "06059",
          date: "2020-05-06",
          cases: 3041,
        },
        {
          deaths: 8,
          county: "Placer",
          state: "California",
          fips: "06061",
          date: "2020-05-06",
          cases: 163,
        },
        {
          deaths: 0,
          county: "Plumas",
          state: "California",
          fips: "06063",
          date: "2020-05-06",
          cases: 4,
        },
        {
          deaths: 190,
          county: "Riverside",
          state: "California",
          fips: "06065",
          date: "2020-05-06",
          cases: 4672,
        },
        {
          deaths: 47,
          county: "Sacramento",
          state: "California",
          fips: "06067",
          date: "2020-05-06",
          cases: 1132,
        },
        {
          deaths: 2,
          county: "San Benito",
          state: "California",
          fips: "06069",
          date: "2020-05-06",
          cases: 53,
        },
        {
          deaths: 104,
          county: "San Bernardino",
          state: "California",
          fips: "06071",
          date: "2020-05-06",
          cases: 2432,
        },
        {
          deaths: 173,
          county: "San Diego",
          state: "California",
          fips: "06073",
          date: "2020-05-06",
          cases: 4382,
        },
        {
          deaths: 31,
          county: "San Francisco",
          state: "California",
          fips: "06075",
          date: "2020-05-06",
          cases: 1779,
        },
        {
          deaths: 27,
          county: "San Joaquin",
          state: "California",
          fips: "06077",
          date: "2020-05-06",
          cases: 579,
        },
        {
          deaths: 1,
          county: "San Luis Obispo",
          state: "California",
          fips: "06079",
          date: "2020-05-06",
          cases: 208,
        },
        {
          deaths: 56,
          county: "San Mateo",
          state: "California",
          fips: "06081",
          date: "2020-05-06",
          cases: 1341,
        },
        {
          deaths: 10,
          county: "Santa Barbara",
          state: "California",
          fips: "06083",
          date: "2020-05-06",
          cases: 613,
        },
        {
          deaths: 122,
          county: "Santa Clara",
          state: "California",
          fips: "06085",
          date: "2020-05-06",
          cases: 2268,
        },
        {
          deaths: 2,
          county: "Santa Cruz",
          state: "California",
          fips: "06087",
          date: "2020-05-06",
          cases: 138,
        },
        {
          deaths: 4,
          county: "Shasta",
          state: "California",
          fips: "06089",
          date: "2020-05-06",
          cases: 31,
        },
        {
          deaths: 0,
          county: "Siskiyou",
          state: "California",
          fips: "06093",
          date: "2020-05-06",
          cases: 5,
        },
        {
          deaths: 7,
          county: "Solano",
          state: "California",
          fips: "06095",
          date: "2020-05-06",
          cases: 342,
        },
        {
          deaths: 4,
          county: "Sonoma",
          state: "California",
          fips: "06097",
          date: "2020-05-06",
          cases: 286,
        },
        {
          deaths: 17,
          county: "Stanislaus",
          state: "California",
          fips: "06099",
          date: "2020-05-06",
          cases: 461,
        },
        {
          deaths: 2,
          county: "Sutter",
          state: "California",
          fips: "06101",
          date: "2020-05-06",
          cases: 31,
        },
        {
          deaths: 1,
          county: "Tehama",
          state: "California",
          fips: "06103",
          date: "2020-05-06",
          cases: 1,
        },
        {
          deaths: 41,
          county: "Tulare",
          state: "California",
          fips: "06107",
          date: "2020-05-06",
          cases: 916,
        },
        {
          deaths: 0,
          county: "Tuolumne",
          state: "California",
          fips: "06109",
          date: "2020-05-06",
          cases: 2,
        },
        {
          deaths: 19,
          county: "Ventura",
          state: "California",
          fips: "06111",
          date: "2020-05-06",
          cases: 608,
        },
        {
          deaths: 20,
          county: "Yolo",
          state: "California",
          fips: "06113",
          date: "2020-05-06",
          cases: 172,
        },
        {
          deaths: 1,
          county: "Yuba",
          state: "California",
          fips: "06115",
          date: "2020-05-06",
          cases: 19,
        },
      ];

      var values = countyData.map((county) => county.deaths); //get all the death data points

      var colorScale = chroma
        .scale(["black", "red"])
        .padding(0.15)
        .domain(values, "q", 5);

      function getColor(val) {
        return colorScale(val).hex();
      }

      const colors = {};

      countyData.forEach(function (county) {
        const GEOID = county.fips;
        const value = county.deaths;
        const color = getColor(value);
        if (!colors[color]) {
          colors[color] = [];
        }
        colors[color].push(GEOID);
      });

      const colorExpression = ["match", ["get", "GEOID"]];
      Object.entries(colors).forEach(function ([color, GEOIDs]) {
        colorExpression.push(GEOIDs, color);
      });

      colorExpression.push("rgba(0,0,0,0)");

      map.addLayer({
        id: "counties",
        type: "fill",
        minzoom: zoomThreshold,
        source: {
          type: "vector",
          tiles: [
            "https://gis-server.data.census.gov/arcgis/rest/services/Hosted/VT_2017_050_00_PY_D1/VectorTileServer/tile/{z}/{y}/{x}.pbf",
          ],
        },
        "source-layer": "County",
        paint: {
          "fill-opacity": 0.6,
          "fill-color": colorExpression,
        },
      });
    });
  }, []);

  return (
    <div>
      <div className={classNames(styles.fill, styles.mask)}></div>
      <div className={classNames(styles.fill, styles.map)} id="map"></div>
    </div>
  );
}
