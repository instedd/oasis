import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import Collapse from "@material-ui/core/Collapse";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import styles from "./styles.module.css";
import api from "utils";
import { sicknessStatus, testStatus, posToLatLng } from "../../routes/types";

const statusMapping = {
  [testStatus.POSITIVE]: { name: "Tested Positive", color: "red" },
  [testStatus.NEGATIVE]: { name: "Tested Negative", color: "purple" },
  [testStatus.NOT_TESTED]: { name: "Not Tested", color: "blue" },
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3RlNTE5IiwiYSI6ImNrOHc1aHlvYTB0N2ozam51MHFiazE3bmcifQ.AHtFuA-pAqau_AJIy-hzOg";

export default function Map(props, { draggable = true }) {
  const countryMinZoom = 3;
  const stateMaxZoom = 4;
  const initialZoom = 1;
  const focusZoom = 8;
  const fillOutlineColor = "rgba(86, 101, 115, 0.5)";

  const userStory = props.userStory;
  const latestMyStory =
    props.latestMyStory && props.latestMyStory.length !== 0
      ? props.latestMyStory
      : props.userStory.latestMyStory;
  const actives = props.actives;
  const deaths = props.deaths;
  const recovered = props.recovered;
  const userNum = props.userNum;
  const storyNum = props.storyNum;

  const dataScope = {
    WORLD: "world",
    US_STATES: "us-states",
    ALL: "all",
  };

  const [map, setMap] = useState(null);
  const [location, setLocation] = useState({
    lng: 0,
    lat: 0,
  });
  const [legendRanges, setLegendRanges] = useState([]);

  useEffect(() => {
    getUserLocation();

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [location.lng, location.lat],
      zoom: initialZoom,
      attributionControl: false,
    });

    adjustMap(map);

    addLayers(map);
    setMap(map);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map &&
      map.flyTo({
        center: [location.lng, location.lat],
        zoom: focusZoom,
        speed: 0.6,
        curve: 1,
      });
  }, [location, map]);

  const adjustMap = (map) => {
    // Add zoom and rotation controls to the map.
    let nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
    });
    map.addControl(nav);

    // disable map rotation using right click + drag
    map.dragRotate.disable();

    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();
  };

  const addLegend = (data) => {
    const clusters = data.clusters;
    const colorGroups = data.groups;
    const newRanges = clusters && [
      {
        label: `${clusters[0][0].toLocaleString()} - ${clusters[0][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[3]),
      },
      {
        label: `${clusters[1][0].toLocaleString()} - ${clusters[3][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[4]),
      },
      {
        label: `${clusters[4][0].toLocaleString()} - ${clusters[5][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[5]),
      },
      {
        label: `${clusters[6][0].toLocaleString()} - ${clusters[6][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[6]),
      },
      {
        label: `${clusters[7][0].toLocaleString()} - ${clusters[7][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[7]),
      },
      {
        label: `${clusters[8][0].toLocaleString()} - ${clusters[8][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[8]),
      },
      {
        label: `${clusters[9][0].toLocaleString()} - ${clusters[9][1].toLocaleString()}`,
        color: getLegendColor(colorGroups[9]),
      },
    ];
    newRanges && setLegendRanges(newRanges);
  };

  const getUserLocation = async () => {
    const userLocation = await fetchUserLocation();
    if (userLocation) {
      setLocation({
        ...location,
        lng: userLocation.lng,
        lat: userLocation.lat,
      });
    }
  };

  const isInRange = (lat, lng) => {
    return lat && lat <= 90 && lat >= -90 && lng && lng <= 180 && lng >= -180;
  };

  const addLayers = async (map) => {
    const data = await fetchCovidData(dataScope.ALL);
    //world data including US for world layer
    const worldData = data["data"]["adm0"] ? data["data"]["adm0"] : [];
    // US data for state layer
    const usStatesData = data["data"]["adm1"]["US"]
      ? data["data"]["adm1"]["US"]
      : [];
    // US data for county layer
    const usCountyData = data["data"]["adm2"] ? data["data"]["adm2"] : [];
    // SD postal code data
    const sdPosData = data["data"]["adm3"] ? data["data"]["adm3"] : [];

    addLegend(data);

    tryToLoad(map, worldData, usStatesData, usCountyData, sdPosData);
  };

  const tryToLoad = async (
    map,
    worldData,
    usStatesData,
    usCountyData,
    sdPosData
  ) => {
    const trueloading = () => {
      map.actuallyLoaded = true;
      load(map, worldData, usStatesData, usCountyData, sdPosData);
    };

    if (map.loaded() || map.actuallyLoaded) {
      trueloading();
    } else if (!map.areTilesLoaded()) {
      map.once("data", trueloading);
    } else if (!map.isStyleLoaded()) {
      map.once("styledata", trueloading);
    } else {
      trueloading();
    }
  };

  const load = async (
    map,
    worldData,
    usStatesData,
    usCountyData,
    sdPosData
  ) => {
    if (worldData && worldData.length > 0) {
      addWorldLayer(map, worldData);
      addNonUSLayer(map, worldData);
    }

    if (usStatesData && usStatesData.length > 0)
      addUSStatesLayer(map, usStatesData);

    if (usCountyData && usCountyData.length > 0)
      addUSCountyLayer(map, usCountyData);

    if (sdPosData && sdPosData.length > 0) addSDPostLayer(map, sdPosData);

    addStoryLayer(map);
  };

  const fetchUserLocation = async () => {
    if (isInRange(userStory.latitude, userStory.longitude)) {
      return { lat: userStory.latitude, lng: userStory.longitude };
    }

    const response = await fetch(`https://freegeoip.app/json/`);
    if (response.status >= 200 && response.status < 300) {
      const jsonResponse = await response.json();
      return { lat: jsonResponse.latitude, lng: jsonResponse.longitude };
    }
  };

  const fetchCovidData = async (scope) => {
    const body = await api(`data/${scope}`, {
      method: "GET",
    });
    return body;
  };

  const fetchStoriesData = async (scope) => {
    const body = await api(`stories/all`, {
      method: "GET",
    });

    return body;
  };

  const getRandomFloat = () => {
    return Math.random() * (Math.random() > 0.5 ? -0.1 : 0.1);
  };

  const storiesToGeoJson = (stories) => {
    stories = stories.filter(
      (story) =>
        story &&
        isInRange(story.latitude, story.longitude) &&
        !story.spam &&
        story.id !== userStory.id
    );

    let features = stories.map((story) => {
      let { latitude, longitude, ...properties } = story;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            longitude + getRandomFloat(),
            latitude + getRandomFloat(),
          ],
        },
        properties: properties,
      };
    });

    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  const postDataToGeojson = (data) => {
    let features = data.map((zipcode) => {
      let { name } = zipcode;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [posToLatLng[name][1], posToLatLng[name][0]],
        },
        properties: zipcode,
      };
    });

    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  const getLegendColor = (group) => {
    return `rgba(${group * 255}, 0, 0, 1)`;
  };

  const getColor = (group) => {
    if (group === 0.1) {
      return `rgba(${0.25 * 255}, 0, 0, 1)`;
    }

    if (group === 0.2 || group === 0.3) {
      return `rgba(${0.45 * 255}, 0, 0, 1)`;
    }

    if (group === 0.4 || group === 0.5) {
      return `rgba(${0.6 * 255}, 0, 0, 1)`;
    }

    return `rgba(${group * 255}, 0, 0, 1)`;
  };

  const getStateColor = (group) => {
    if (group === 0.1) {
      return `rgba(${0.15 * 255}, 20, 20, 1)`;
    }

    if (group === 0.2 || group === 0.3) {
      return `rgba(${0.3 * 255}, 20, 20, 1)`;
    }

    if (group === 0.4 || group === 0.5) {
      return `rgba(${0.45 * 255}, 20, 20, 1)`;
    }

    return `rgba(${(group - 0.15) * 255}, 20, 20, 1)`;
  };

  const addWorldLayer = async (map, data) => {
    const covidData = await data;
    const expression = covidData.map((row) => [row.name, getColor(row.group)]);

    map.addLayer(
      {
        id: "world-layer",
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

    map.on("mousemove", function (e) {
      let countries = map.queryRenderedFeatures(e.point, {
        layers: ["world-layer"],
      });

      if (countries.length > 0) {
        const country_name = countries[0].properties.name;
        const country = covidData.filter(
          (country) => country.name === country_name
        );

        if (country.length > 0 && country[0].confirmed) {
          document.getElementById("pd").innerHTML =
            "<h2>" +
            country_name +
            "</h2><h3>" +
            country[0].confirmed +
            " cases confirmed</h3>";
        } else {
          document.getElementById("pd").innerHTML =
            "<h2>" + country_name + "</h2><h3> NA </h3>";
        }
      } else {
        document.getElementById("pd").innerHTML =
          "<h2> Confirmed Cases </h2> <h3>Hover over/Click a state or country!</h3>";
      }
    });
  };

  const addNonUSLayer = async (map, data) => {
    const covidData = await data;

    // Delete US from the world expression(all expression)
    const expression = covidData
      .filter((country) => country.name !== "United States of America")
      .map((row) => [row.name, getColor(row.group)]);

    map.addLayer(
      {
        id: "non-us-layer",
        type: "fill",
        layout: {},
        minzoom: countryMinZoom,
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

    map.on("mousemove", function (e) {
      let countries = map.queryRenderedFeatures(e.point, {
        layers: ["non-us-layer"],
      });

      if (
        countries.length > 0 &&
        countries[0].properties.name &&
        countries[0].properties.name !== "United States of America"
      ) {
        const country_name = countries[0].properties.name;
        const country = covidData.filter(
          (country) => country.name === country_name
        );

        if (country.length > 0 && country[0].confirmed) {
          document.getElementById("pd").innerHTML =
            "<h2>" +
            country_name +
            "</h2><h3>" +
            country[0].confirmed +
            " cases confirmed</h3>";
        } else {
          document.getElementById("pd").innerHTML =
            "<h2>" + country_name + "</h2><h3> NA </h3>";
        }
      }
    });
  };

  const addUSStatesLayer = async (map, data) => {
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
      let stateID = row.name;
      if (stateID in stateToFIPS) {
        expression.push(stateToFIPS[stateID], getStateColor(row.group));
      }
    });
    expression.push("rgba(0,0,0,0)"); // Last value is the default, used where there is no data

    map.addLayer(
      {
        id: "us-states-layer",
        type: "fill",
        source: "states",
        minzoom: countryMinZoom,
        maxzoom: stateMaxZoom,
        "source-layer": "states",
        paint: {
          "fill-color": expression,
          "fill-outline-color": fillOutlineColor,
          "fill-opacity": 1,
        },
      },
      "waterway-label"
    );

    // add the information window
    map.on("mousemove", function (e) {
      let states = map.queryRenderedFeatures(e.point, {
        layers: ["us-states-layer"],
      });

      if (states.length > 0) {
        const state_name = states[0].properties.STATE_NAME;
        const abbr_name = Object.keys(stateToFIPS).find(
          (key) => stateToFIPS[key] === states[0].properties.STATE_ID
        );
        const confirmed = usData.filter((state) => state.name === abbr_name)[0]
          .confirmed;

        document.getElementById("pd").innerHTML =
          "<h2>" +
          state_name +
          "</h2><h3>" +
          confirmed +
          " cases confirmed</h3>";
      }
    });
  };

  const addUSCountyLayer = async (map, data) => {
    const countyData = await data;
    // Add the source to query.
    // https://docs.mapbox.com/mapbox-gl-js/example/queryrenderedfeatures-around-point
    map.addSource("counties", {
      type: "vector",
      url: "mapbox://mapbox.82pkq93d",
    });

    const expression = ["match", ["to-string", ["get", "FIPS"]]];

    countyData.forEach(function (row) {
      if (typeof row.fips === "number" || typeof row.fips === "string") {
        if (!expression.includes(row.fips)) {
          expression.push(row.fips, getStateColor(row.group));
        } else {
          console.log("There is a duplicate fips");
        }
      } else {
        console.log("The fips is not a number or string");
      }
    });
    expression.push("rgba(0,0,0,0)"); // Last value is the default, used where there is no data

    map.addLayer(
      {
        id: "us-counties-layer",
        type: "fill",
        source: "counties",
        minzoom: stateMaxZoom,
        maxzoom: focusZoom,
        "source-layer": "original",
        paint: {
          "fill-color": expression,
          "fill-outline-color": fillOutlineColor,
          "fill-opacity": 1,
        },
      },
      "settlement-label"
    ); // Place polygon under these labels.

    // add the information window
    map.on("mousemove", function (e) {
      let counties = map.queryRenderedFeatures(e.point, {
        layers: ["us-counties-layer"],
      });

      if (counties.length > 0) {
        const name = counties[0].properties.COUNTY;
        const target_counties = countyData.filter(
          (county) => counties[0].properties.FIPS.toString() === county.fips
        );
        const confirmed =
          target_counties.length > 0 ? target_counties[0].confirmed : "NA";

        document.getElementById("pd").innerHTML =
          "<h2>" + name + "</h2><h3>" + confirmed + " probable cases</h3>";
      }
    });
  };

  const addSDPostLayer = async (map, data) => {
    const sdPosData = await data;
    const geojson = postDataToGeojson(sdPosData);

    map.addSource("sd-pos", {
      type: "geojson",
      data: geojson,
    });

    map.addLayer(
      {
        id: "sd-pos-layer",
        type: "circle",
        source: "sd-pos",
        minzoom: focusZoom,
        paint: {
          // Size circle radius by earthquake magnitude and zoom level
          "circle-radius": ["+", ["/", ["get", "confirmed"], 80], 3],
          // Color circle by earthquake magnitude
          "circle-color": "rgb(239,138,98)",
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
          // Transition from heatmap to circle layer by zoom level
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.9,
            11,
            0.5,
          ],
        },
      },
      "waterway-label"
    );

    // add the information window
    map.on("mousemove", function (e) {
      let zipcodes = map.queryRenderedFeatures(e.point, {
        layers: ["sd-pos-layer"],
      });

      if (zipcodes.length > 0) {
        const name = zipcodes[0].properties.name;
        const confirmed = zipcodes[0].properties.confirmed;

        document.getElementById("pd").innerHTML =
          "<h2>" +
          name +
          ", San Diego</h2><h3>" +
          confirmed +
          " cases confirmed</h3>";
      }
    });
  };

  const storyStyle =
    '<p style="font-size: 18px;line-height: 18px; color:black">';
  const demographicStyle = '<p style = "line-height:0.9rem;font-size:0.9rem;">';

  const addCircle = (status, content) => {
    const color = status.color;
    const word = status.name;
    content +=
      '<div style="position:relative;width: 8px; height: 8px;line-height:0.8rem;font-size:0.8rem;' +
      "margin-right: 10px;top:7px;float: left;border-radius: 50%;background:";
    content = content + color + ';"></div>';
    content =
      content +
      '<p style="position:relative;top:5px;right:5px;float:left;' +
      "color:" +
      color +
      ';line-height:0.8rem;font-size:0.8rem;">' +
      word.toUpperCase() +
      "</p>";
    return content;
  };

  const popUpContent = (userStory, isUser) => {
    let mystory = isUser ? latestMyStory : userStory.latestMyStory;
    let content = "<p>";
    content += storyStyle;
    if (mystory) {
      content += mystory;
    }
    content += "</p>";
    if (mystory)
      content +=
        '<hr style="height:1px;border-width:0;color:gray;background-color:gray" </hr>';
    content += demographicStyle;
    if (userStory.age)
      content = content + "A " + userStory.age + " years old user";
    else content += "A user";
    if (userStory.profession !== "")
      content +=
        " working in the " + userStory.profession.toLowerCase() + " industry ";

    content = content + " near " + userStory.state;
    let date = userStory.createdAt ? userStory.createdAt.substring(0, 10) : "";
    if (date !== "") content = content + " on " + date;

    content += ".</p>";
    content += '<div style="line-height:0.8rem;" class="row">';
    content = addCircle(statusMapping[userStory.sick], content);
    content = addCircle(statusMapping[userStory.tested], content);
    content += "</div>";
    return content;
  };

  const setHover = (marker, content, map) => {
    let popup = new mapboxgl.Popup({
      className: classNames(styles.popups),
      closeButton: true,
      closeOnClick: true,
    });
    popup.setHTML(content);
    const element = marker.getElement();
    element.id = "marker";

    // add popup to marker
    marker.setPopup(popup);
  };

  const addStoryLayer = async (map) => {
    const storiesData = await fetchStoriesData();
    const geojson = storiesToGeoJson(storiesData);

    // Add other users' story
    map.addSource("places", {
      type: "geojson",
      data: geojson,
    });

    // add markers to map
    geojson.features.forEach(function (marker) {
      // create a HTML element for each feature
      let el = document.createElement("div");
      el.className = "marker";

      let content = popUpContent(marker.properties, false);
      // create the marker
      const sickStatus = marker.properties.sick;
      const currmarker = new mapboxgl.Marker({
        color: statusMapping[sickStatus].color,
      }).setLngLat(marker.geometry.coordinates);
      //attach the popup
      setHover(currmarker, content, map);
      // add marker to map
      currmarker.addTo(map);
    });

    const content = popUpContent(userStory, true);
    // create the marker
    if (isInRange(userStory.latitude, userStory.longitude)) {
      const marker = new mapboxgl.Marker().setLngLat([
        userStory.longitude,
        userStory.latitude,
      ]);
      //attach popup
      setHover(marker, content, map);
      // add marker to map
      marker.addTo(map);
    }
  };

  const [expanded, setExpanded] = React.useState(
    window.screen.width > 1024 ? true : false
  );

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const legend = (
    <div className={classNames(styles.legendWrapper)}>
      <div className={classNames(styles.legend)} id="legend">
        <div className={classNames(styles.legendCollapse)}>
          <h3>Confirmed Cases</h3>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandLessIcon />
          </IconButton>
        </div>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {legendRanges.map((range, i) => (
            <div className={classNames(styles.legendItem)} key={i}>
              <span style={{ backgroundColor: range.color }}></span>
              {range.label}
            </div>
          ))}
        </Collapse>
      </div>
      <div className={classNames(styles.statusLegend)}>
        <div>
          <h2> Global Total </h2>
          <h3>
            Confirmed: {actives} <br />
            Deaths: {deaths} <br />
            Recovered: {recovered}
          </h3>
        </div>
        <div id="pd">
          <h2> Confirmed Cases </h2>
          <h3> Hover over/Click a state or country!</h3>
        </div>
        <Divider style={{ color: "black" }} />
        <div style={{ paddingTop: 5, color: "#dcd6d3" }}>
          <em>
            <p id="users_num">There are {userNum} users on OASIS</p>
            <p id="stories_num">{storyNum} of them shared their stories</p>
          </em>
        </div>
      </div>
    </div>
  );

  const draggableDependantFeatures = () => {
    if (draggable) {
      return legendRanges.length !== 0 ? legend : null;
    }
    return <div className={classNames(styles.fill, styles.mask)} />;
  };

  return (
    <div className={styles.root}>
      <div className={styles.random}>
        The locations of markers are randomized.
      </div>
      <div
        style={{ color: "gray" }}
        className={classNames([
          styles.fill,
          styles.map,
          !draggable && styles.opaque,
        ])}
        id="map"
      ></div>
      {draggableDependantFeatures()}
    </div>
  );
}
