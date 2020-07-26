import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import RoomRoundedIcon from "@material-ui/icons/RoomRounded";
import styles from "./styles.module.css";
import api from "utils";
import { sicknessStatus, testStatus } from "../../routes/types";

const statusMapping = {
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

const teststatusMapping = {
  [testStatus.NEGATIVE]: { name: "Tested Negative" },
  [testStatus.POSITIVE]: { name: "Tested Positive" },
  [testStatus.NOT_TESTED]: { name: "Not Tested" },
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
        story.latitude &&
        story.longitude &&
        !story.spam &&
        story.createdAt &&
        story.id !== userStory.id
    );

    let features = stories.map((story) => {
      let { latitude, longitude, ...properties } = story;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            latitude + getRandomFloat(),
            longitude + getRandomFloat(),
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

  const createPopup = (userStory, content) => {
    if (userStory.age) content = content + " " + userStory.age + " years old";
    content += content.length !== 0 ? " user " : " User ";
    if (userStory.profession !== "")
      content =
        content +
        " working in " +
        userStory.profession.toLowerCase() +
        " industry ";
    content = content + "living near " + userStory.state;
    var date = userStory.createdAt.substring(0, 10);
    if (userStory.myStory) content = content + " on " + date;
    content += ".";
    const sickColor = statusMapping[userStory.sick].color;
    content =
      content +
      '<p style="color:' +
      sickColor +
      ';">' +
      "<u>" +
      statusMapping[userStory.sick].name +
      "</u></p>";
    return content;
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

      var popup = new mapboxgl.Popup({ offset: 25 });
      content = "";
      //add user story if has any
      if (myStory) content = content + '<p>"' + myStory + '"</p>-From';
      popup.setHTML(createPopup(marker.properties, content));
      map.on("mouseenter", "places", function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = "pointer";
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.myStory;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
      });

      map.on("mouseleave", "places", function () {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // create the marker
      const sickStatus = marker.properties.sick;
      new mapboxgl.Marker({ color: statusMapping[sickStatus].color })
        .setLngLat(marker.geometry.coordinates)
        .setPopup(popup) // sets a popup on this marker
        .addTo(map);
    });

    // Add current user's marker
    // create the popup
    const date = userStory.createdAt;
    const story = userStory.myStory;
    console.log(userStory);
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25,
    });
    var content = "";
    if (story) {
      if (date) {
        content = content + "<p><b>" + date + "</b></p>";
      }
      content = content + '<p>"' + story + '"</p>';
    }
    if (content === "")
      content = "<h3> You haven't share your story yet! </h3>";

    popup.setHTML(content);
    //popup.setHTML(createPopup(userStory,content));

    // create the marker
    new mapboxgl.Marker()
      .setLngLat([userStory.latitude, userStory.longitude])
      .setPopup(popup) // sets a popup on this marker
      .addTo(map);
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
