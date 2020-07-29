import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import RoomRoundedIcon from "@material-ui/icons/RoomRounded";
import styles from "./styles.module.css";
import api from "utils";
import { sicknessStatus, testStatus } from "../../routes/types";

const statusMapping = {
  [testStatus.POSITIVE]: { name: "Tested Positive", color: "red" },
  [testStatus.NEGATIVE]: { name: "Tested Negative", color: "purple" },
  [testStatus.NOT_TESTED]: { name: "Not Tested", color: "blue" },
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

const statusColor = [
  { text: "My story", color: "#3bb2d0" },
  { text: "Sick", color: statusMapping[sicknessStatus.SICK].color },
  { text: "Not sick", color: statusMapping[sicknessStatus.NOT_SICK].color },
  { text: "Recovered", color: statusMapping[sicknessStatus.RECOVERED].color },
];

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3RlNTE5IiwiYSI6ImNrOHc1aHlvYTB0N2ozam51MHFiazE3bmcifQ.AHtFuA-pAqau_AJIy-hzOg";

export default function Map(props, { draggable = true }) {
  const countryMinZoom = 3.5;
  const initialZoom = 5;
  const focusZoom = 6;
  const fillOutlineColor = "rgba(86, 101, 115, 0.5)";

  const userStory = props.userStory;

  const dataScope = {
    WORLD: "world",
    US_STATES: "us-states",
    ALL: "all",
  };

  const [map, setMap] = useState(null);
  const [location, setLocation] = useState({
    lng: -119.6,
    lat: 36.7,
  });
  const [legendRanges, setLegendRanges] = useState([]);

  useEffect(() => {
    getUserLocation();

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [location.lng, location.lat],
      zoom: initialZoom,
    });

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

  const addLegend = (data) => {
    const clusters = data.clusters;
    const colorGroups = data.groups;
    const newRanges =
      clusters &&
      clusters.map((range, i) => {
        return {
          label: `${range[0].toLocaleString()} - ${range[1].toLocaleString()}`,
          color: getColor(colorGroups[i]),
        };
      });
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
    const worldData = data["data"]["adm0"];
    // US data for state layer
    const usStatesData = data["data"]["adm1"]["US"];
    addLegend(data);

    map.on("load", function () {
      addWorldLayer(map, worldData);
      addNonUSLayer(map, worldData);
      addUSStatesLayer(map, usStatesData);
      addStoryLayer(map);
    });
  };

  const fetchUserLocation = async () => {
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
    return storiesToGeoJson(body);
  };

  const getRandomFloat = () => {
    return Math.random() * (Math.random() > 0.5 ? -1 : 1);
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

  const getColor = (group) => {
    return `rgba(${group * 255}, 0, 0, 1)`;
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
      var stateID = row.name;
      if (stateID in stateToFIPS) {
        expression.push(stateToFIPS[stateID], getColor(row.group));
      }
    });
    expression.push("rgba(0,0,0,0)"); // Last value is the default, used where there is no data

    map.addLayer(
      {
        id: "us-states-layer",
        type: "fill",
        source: "states",
        minzoom: countryMinZoom,
        "source-layer": "states",
        paint: {
          "fill-color": expression,
          "fill-outline-color": fillOutlineColor,
          "fill-opacity": 1,
        },
      },
      "waterway-label"
    );
  };

  const addCircle = (status, content) => {
    const color = status.color;
    const word = status.name;
    content +=
      '<div style="position:relative;width: 8px; height: 8px;line-height:2vh;font-size:2vh;' +
      "margin-right: 10px;top:5px;float: left;border-radius: 50%;background:";
    content = content + color + ';"></div>';
    content =
      content +
      '<p style="position:relative;top:5px;right:5px;float:left;' +
      "color:" +
      color +
      ';line-height:2vh;font-size:2vh;">' +
      word.toUpperCase() +
      "</p>";
    return content;
  };
  const popUpContent = (userStory, content) => {
    if (userStory.age) content = content + " " + userStory.age + " years old";
    content += userStory.myStory || userStory.age ? " user " : " User ";
    if (userStory.profession !== "")
      content =
        content +
        " working in the " +
        userStory.profession.toLowerCase() +
        " industry ";
    content = content + "living in " + userStory.state;
    var date = userStory.createdAt.substring(0, 10);
    if (userStory.myStory) content = content + " on " + date;
    content += ".</p>";
    content += '<div style="line-height:2vh;" class="row">';
    content = addCircle(statusMapping[userStory.sick], content);
    content = addCircle(statusMapping[userStory.tested], content);
    content += "</div>";
    return content;
  };

  const setHover = (marker, content, map) => {
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25,
    });
    popup.setHTML(content);
    const element = marker.getElement();
    element.id = "marker";
    // hover event listener
    element.addEventListener("mouseenter", () => popup.addTo(map));
    element.addEventListener("mouseleave", () => popup.remove());
    // add popup to marker
    marker.setPopup(popup);
  };

  const addStoryLayer = async (map) => {
    var geojson = await fetchStoriesData();

    // Add other users' story
    map.addSource("places", {
      type: "geojson",
      data: geojson,
    });

    // add markers to map
    geojson.features.forEach(function (marker) {
      // create a HTML element for each feature
      var el = document.createElement("div");
      el.className = "marker";
      var myStory = marker.properties.myStory;

      content = "";
      //add user story if has any
      if (myStory)
        content =
          content +
          '<p style="font-size:5vh;line-height:5vh;">"' +
          myStory +
          '"</p><p style = "line-height:3vh;font-size:3vh;">- From';
      else content += '<p style = "line-height:3vh;font-size:3vh;">';
      content = popUpContent(marker.properties, content);

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

    // Add current user's marker
    // create the popup
    const date = userStory.createdAt;
    const story = userStory.myStory;
    var content = '<p style="font-size:4vh;line-height:4vh;">';
    if (story) {
      content = content + '"' + story + '"</p>';
      if (date) content = content + "<p> - on" + date + "</p>";
    } else content += "You haven't share your story yet! </p>";

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

  const legend = (
    <div className={classNames(styles.legend)} id="legend">
      <h3>Active cases</h3>
      {legendRanges.map((range, i) => (
        <div className={classNames(styles.legendItem)} key={i}>
          <span style={{ backgroundColor: range.color }}></span>
          {range.label}
        </div>
      ))}
      <h3 style={{ marginTop: "8px" }}>Story markers</h3>
      {statusColor.map((status, i) => (
        <div className={classNames(styles.legendItem)} key={i}>
          <RoomRoundedIcon
            style={{ color: status.color, fontSize: "medium" }}
          />
          <sup style={{ fontSize: "12px" }}> {status.text} </sup>
        </div>
      ))}
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
      <div className={styles.refresh}>
        Please refresh the page if the map is gray.
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
