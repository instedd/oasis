import {
  TextField,
  Fab,
  FormControl,
  ListItem,
  List,
  ListItemText,
} from "@material-ui/core";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import SimpleMap from "components/SimpleMap";
import paths from "routes/paths";
import styles from "./styles.module.css";
import { setMyStory } from "../../actions/story";
import { fields, initialFieldsState } from "./fields";

export default function Home(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();

  const [myStory, updateMyStory] = useState("");
  const [draggableMap, setDraggableMap] = useState(false);
  const [visibility, setVisibility] = useState("visible");
  const [locationList, setListItems] = useState([]);
  const [formValues, setFormValues] = useState(initialFieldsState());

  let location = useLocation();

  const MAPBOX_APIKEY =
    "pk.eyJ1IjoieXVzMjUyIiwiYSI6ImNrYTZhM2VlcjA2M2UzMm1uOWh5YXhvdGoifQ.ZIzOiYbBfwJsV168m42iFg";

  useEffect(() => {
    let shouldDragMap = draggableMapRoutes.includes(location.pathname);
    if (shouldDragMap !== draggableMap) {
      setDraggableMap(draggableMapRoutes.includes(location.pathname));
    }
  }, [location, draggableMap, setDraggableMap, draggableMapRoutes]);

  const handleChange = (event) => {
    if (event.target.value) {
      setVisibility("hidden");
    } else {
      setVisibility("visible");
    }
    updateMyStory(event.target.value);
  };

  const handleSubmit = (event, route) => {
    dispatch(setMyStory(myStory));

    props.history.push(route, { from: "shareBtn" });
  };

  const onQuery = (event) => {
    let tempList = [];
    const query = event.target.value;
    const url =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      query +
      ".json?access_token=" +
      MAPBOX_APIKEY;
    setFormValues({
      ...formValues,
      city: query,
    });
    fetch(url)
      .then((response) => response.json())
      .then((jsondata) => {
        if ("features" in jsondata && jsondata.features.length > 0) {
          const places = jsondata.features;
          places.forEach((place) => {
            const place_name = place.place_name;
            const address = place_name.split(",");
            let city = "";
            let state = "";
            let country = "";
            if (address.length > 0) {
              country = address[address.length - 1].trim();
            }

            if (address.length > 1) {
              state = address[address.length - 2].trim();
            }
            if (address.length > 2) {
              city = address[address.length - 3].trim();
            }
            const result = { city: city, state: state, country: country };
            tempList.push(result);
          });
          setListItems(removeDuplicates(tempList, "state"));
        } else {
          setListItems([]);
        }
      });
  };

  function removeDuplicates(array, key) {
    let lookup = {};
    let result = [];
    array.forEach((element) => {
      if (!lookup[element[key]]) {
        lookup[element[key]] = true;
        result.push(element);
      }
    });
    return result;
  }

  const handleFormChange = (field) => (event) => {
    const key = field.key;
    setFormValues({ ...formValues, [key]: event.target.value });
  };

  return (
    <>
      <div className={classNames("home", styles.home)}>
        <h1 className="title">Share your pandemic experience!</h1>
        <p>
          COVID-19 has affected everyone. Sick or healthy, we've all had a
          pandemic experience. Whether illness, isolation or innovation, put
          your story on the map, see how you compare to others, share new
          insights, join your planet!
        </p>
        <div>
          <TextField
            placeholder="Type your story here!"
            multiline
            rowsMax={3}
            value={myStory}
            onChange={handleChange}
            className={classNames("textarea", styles.textarea)}
            variant="outlined"
          />
        </div>
        <div
          className={classNames("location-wrapper", styles["location-wrapper"])}
        >
          <div className={classNames("grid-1", styles["grid-1"])}>
            <FormControl>
              <TextField
                label={fields.CITY.label}
                value={formValues[fields.CITY.key]}
                onChange={onQuery}
                InputProps={{ inputProps: { min: 0 } }}
                variant="outlined"
              />
              <List dense id="on_list">
                {locationList.map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      setFormValues({
                        ...formValues,
                        city: item.city,
                        state: item.state,
                        country: item.country,
                      });
                      setListItems([]);
                    }}
                  >
                    <ListItemText>
                      {item.city}, {item.state}, {item.country}
                    </ListItemText>
                  </ListItem>
                ))}
                {formValues[fields.CITY.key] &&
                  formValues[fields.CITY.key].length && (
                    <ListItem
                      key="off"
                      button
                      onClick={() => {
                        document.getElementById("on_list").style.display =
                          "none";
                      }}
                    >
                      <ListItemText style={{ color: "red" }}>
                        Turn Off Adrress Autocompletion
                      </ListItemText>
                    </ListItem>
                  )}
              </List>
              <List dense id="off_list">
                {formValues[fields.CITY.key] &&
                  formValues[fields.CITY.key].length &&
                  document.getElementById("on_list").style.display ===
                    "none" && (
                    <ListItem
                      key="on"
                      button
                      onClick={(e) => {
                        document.getElementById("on_list").style.display =
                          "inline";
                        document.getElementById("off_list").style.display =
                          "none";
                      }}
                    >
                      <ListItemText style={{ color: "green" }}>
                        Turn On Adrress Autocompletion
                      </ListItemText>
                    </ListItem>
                  )}
              </List>
            </FormControl>

            <TextField
              label={fields.STATE.label + " *"}
              value={formValues[fields.STATE.key]}
              onChange={handleFormChange(fields.STATE)}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />

            <TextField
              label={fields.COUNTRY.label + " *"}
              value={formValues[fields.COUNTRY.key]}
              onChange={handleFormChange(fields.COUNTRY)}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />
          </div>
        </div>
        <div className={classNames("btnGroup", styles.btnGroup)}>
          <Fab
            style={{ background: "#9206FF", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={(e) => handleSubmit(e, paths.signIn)}
            variant="extended"
          >
            SHARE MY STORY
          </Fab>
        </div>
      </div>
      <div className={classNames("background", styles.background)} />
      <SimpleMap draggable={draggableMap} />
    </>
  );
}
