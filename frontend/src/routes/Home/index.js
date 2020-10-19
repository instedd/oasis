import {
  TextField,
  Fab,
  FormControl,
  ListItem,
  List,
  ListItemText,
  MenuItem,
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

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: 12,
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

  const fetchUserLocation = async () => {
    let tempList = [];
    const response = await fetch(`https://freegeoip.app/json/`);

    if (response.status >= 200 && response.status < 300) {
      const jsonResponse = await response.json();
      let city = jsonResponse.city;
      let state = jsonResponse.region_name;
      let country = jsonResponse.country_name;

      tempList.push({ city: city, state: state, country: country });
    } else {
      alert("Cannot locate your city.");
    }
    setListItems(tempList);
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
      width: "100%",
      "& label": {
        color: "#ffffff80",
        fontSize: 12,
      },
      "& .MuiSelect-outlined.MuiSelect-outlined, .MuiOutlinedInput-input": {
        fontSize: 12,
      },
    },
  })(TextField);

  const locations = () => (
    <Grid container spacing={1} className={classes.container}>
      <Grid item xs={3}>
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
          </List>
        </FormControl>
      </Grid>
      <Grid item xs={5}>
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
        <IconButton
          aria-label="location"
          style={{ color: "#ffffff" }}
          onClick={fetchUserLocation}
        >
          <PersonPinCircleIcon />
        </IconButton>
      </Grid>
    </Grid>
  );

  const status = () => (
    <Grid container spacing={1}>
      <Grid container item xs={5}>
        <LightTextField
          label={fields.SICKNESSSTATUS.label + " *"}
          select
          value={formValues[fields.SICKNESSSTATUS.key]}
          onChange={handleFormChange(fields.SICKNESSSTATUS)}
          variant="outlined"
        >
          <MenuItem key="sick" value="sick">
            Yes, I am sick
          </MenuItem>
          <MenuItem key="not sick" value="not sick">
            {" "}
            No, I am not sick
          </MenuItem>
          <MenuItem key="recovered" value="recovered">
            No, I have recovered
          </MenuItem>
        </LightTextField>
      </Grid>

      <Grid container item xs={7}>
        <LightTextField
          label={fields.TESTEDSTATUS.label + " *"}
          select
          value={formValues[fields.TESTEDSTATUS.key]}
          onChange={handleFormChange(fields.TESTEDSTATUS)}
          variant="outlined"
        >
          <MenuItem key="positive" value="positive">
            Yes, tested positive
          </MenuItem>
          <MenuItem key="negative" value="negative">
            Yes, tested negative
          </MenuItem>
          <MenuItem key="not tested" value="not tested">
            No, I have not tested
          </MenuItem>
        </LightTextField>
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
        {status()}
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
