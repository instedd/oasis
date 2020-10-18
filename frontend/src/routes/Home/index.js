import {
  TextField,
  Fab,
  FormControl,
  ListItem,
  List,
  ListItemText,
  Slider,
  Grid,
  Button,
  IconButton,
} from "@material-ui/core";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import SimpleMap from "components/SimpleMap";
import paths from "routes/paths";
import styles from "./styles.module.css";
import { setStory, setMyStory } from "actions/story";
import { fields, initialFieldsState } from "./fields";
import PersonPinCircleIcon from "@material-ui/icons/PersonPinCircle";
import { getGeocoding } from "utils";
import { sicknessStatus } from "../types";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: "1rem",
  },
  list: {
    position: "absolute",
    top: 65,
    zIndex: 2,
    background: "#000",
    width: "max-content",
  },
}));
export default function Home(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [myStory, updateMyStory] = useState("");
  const [draggableMap, setDraggableMap] = useState(false);
  const [locationList, setListItems] = useState([]);
  const [formValues, setFormValues] = useState(initialFieldsState());

  const sicknessMarks = [
    {
      value: 0,
      label: "sick",
    },
    {
      value: 1,
      label: "not sick",
    },
    {
      value: 2,
      label: "recovered",
    },
  ];
  const testedMarks = [
    {
      value: 0,
      label: "not tested",
    },
    {
      value: 1,
      label: "tested positive",
    },
    {
      value: 2,
      label: "tested negative",
    },
  ];

  function valuetext(value) {
    return `${value}`;
  }

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
    updateMyStory(event.target.value);
  };

  const handleSubmit = (event, route) => {
    getGeocoding().then((coordinates) => {
      const { ...story } = formValues;

      // check if the user has filled valid city, state, and country
      if (coordinates) {
        story.latitude = coordinates[1]; // coordinates = [lng, lat]
        story.longitude = coordinates[0];
      }

      //TODO: get from slider
      story.sick = "not_sick";
      story.tested = "not_tested";

      dispatch(setStory(story));
      dispatch(setMyStory(myStory));
      props.history.push(route, { from: "shareBtn" });
    });
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

  const DarkSlider = withStyles({
    root: {
      color: "#fff",
      height: 8,
    },
    thumb: {
      height: 24,
      width: 24,
      backgroundColor: "#fff",
      border: "2px solid currentColor",
      marginTop: -8,
      marginLeft: -12,
      "&:focus, &:hover, &$active": {
        boxShadow: "inherit",
      },
    },
    active: {},
    track: {
      height: 8,
      borderRadius: 4,
    },
    rail: {
      height: 8,
      borderRadius: 4,
    },
    mark: {
      display: "none",
    },
    markLabel: {
      color: "#ffffff80",
      fontVariant: "small-caps",
      paddingTop: 2,
    },
  })(Slider);

  const LightTextField = withStyles({
    root: {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#fff",
          borderRadius: 4,
        },
        "&:hover fieldset": {
          borderColor: "#ffff",
        },
        color: "white",
      },
      ".MuiOutlinedInput-input": {
        color: "white",
      },
      "& label": {
        color: "#ffffff80",
        fontSize: 12,
      },
    },
  })(TextField);

  const locations = () => (
    <Grid container spacing={1} className={classes.container}>
      <Grid item xs={4}>
        <FormControl>
          <LightTextField
            label={fields.CITY.label}
            value={formValues[fields.CITY.key]}
            onChange={onQuery}
            InputProps={{ inputProps: { min: 0 } }}
            variant="outlined"
          />
          <List dense id="on_list" className={classes.list}>
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
            {formValues[fields.CITY.key] && formValues[fields.CITY.key].length && (
              <ListItem
                key="off"
                button
                onClick={() => {
                  document.getElementById("on_list").style.display = "none";
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
              document.getElementById("on_list").style.display === "none" && (
                <ListItem
                  key="on"
                  button
                  onClick={(e) => {
                    document.getElementById("on_list").style.display = "inline";
                    document.getElementById("off_list").style.display = "none";
                  }}
                >
                  <ListItemText style={{ color: "green" }}>
                    Turn On Adrress Autocompletion
                  </ListItemText>
                </ListItem>
              )}
          </List>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <LightTextField
          label={fields.STATE.label + " *"}
          value={formValues[fields.STATE.key]}
          onChange={handleFormChange(fields.STATE)}
          InputProps={{ inputProps: { min: 0 } }}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={3}>
        <LightTextField
          label={fields.COUNTRY.label + " *"}
          value={formValues[fields.COUNTRY.key]}
          onChange={handleFormChange(fields.COUNTRY)}
          InputProps={{ inputProps: { min: 0 } }}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={1}>
        <IconButton aria-label="location" style={{ color: "#ffffff" }}>
          <PersonPinCircleIcon />
        </IconButton>
      </Grid>
    </Grid>
  );

  const sliders = () => (
    <Grid container spacing={1} className={classes.container}>
      <Grid item xs={12}>
        <DarkSlider
          defaultValue={1}
          getAriaValueText={valuetext}
          aria-labelledby="sickness-slider"
          min={0}
          max={2}
          step={1}
          track={false}
          marks={sicknessMarks}
        />
      </Grid>
      <Grid item xs={12}>
        <DarkSlider
          defaultValue={1}
          getAriaValueText={valuetext}
          aria-labelledby="tested-slider"
          min={0}
          max={2}
          step={1}
          track={false}
          marks={testedMarks}
        />
      </Grid>
    </Grid>
  );
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
        {locations()}
        {sliders()}
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
          <Button
            aria-label="skip"
            size="medium"
            onClick={() => props.history.push(paths.signIn)}
            style={{ color: "#ffffff80" }}
          >
            SKIP AND CONTINUE
          </Button>
        </div>
      </div>

      <div className={classNames("background", styles.background)} />
      <SimpleMap draggable={draggableMap} />
    </>
  );
}
