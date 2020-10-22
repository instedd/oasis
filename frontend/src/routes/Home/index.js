import {
  TextField,
  Fab,
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
import { sicknessStatus, testStatus } from "routes/types";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: 12,
  },
}));
export default function Home(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [myStory, updateMyStory] = useState("");
  const [draggableMap, setDraggableMap] = useState(false);
  const [formValues, setFormValues] = useState(initialFieldsState());
  const [errorMsg, setErrorMsg] = useState({
    display: "none",
    requiredFields: null,
  });

  let location = useLocation();

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
    let tempList = [];
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === null && key !== "city") tempList.push(key);
    });
    if (tempList.length > 0) {
      setErrorMsg({
        display: "block",
        required: tempList
          .join(", ")
          .replace("sicknessStatus", "are you sick?")
          .replace("testedStatus", "have you been tested for COVID-19?"),
      });
    } else {
      getGeocoding(
        formValues[fields.CITY.key],
        formValues[fields.STATE.key],
        formValues[fields.COUNTRY.key]
      ).then((coordinates) => {
        const { ...story } = formValues;
        if (coordinates) {
          story.latitude = coordinates[1]; // coordinates = [lng, lat]
          story.longitude = coordinates[0];
        }
        dispatch(setStory(story));
        dispatch(setMyStory(myStory));
        props.history.push(route, { from: "shareBtn" });
      });
    }
  };

  const fetchUserLocation = async () => {
    let tempCity,
      tempState,
      tempCountry = "";
    const response = await fetch(`https://freegeoip.app/json/`);

    if (response.status >= 200 && response.status < 300) {
      const jsonResponse = await response.json();
      tempCity = jsonResponse.city;
      tempState = jsonResponse.region_name;
      tempCountry = jsonResponse.country_name;
    } else {
      alert("Cannot locate your city.");
    }

    setFormValues({
      ...formValues,
      ["city"]: tempCity,
      ["state"]: tempState,
      ["country"]: tempCountry,
    });
  };

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
        <LightTextField
          label={fields.CITY.label}
          value={formValues[fields.CITY.key]}
          onChange={() => handleFormChange(fields.CITY)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={5}>
        <LightTextField
          required
          label={fields.STATE.label}
          value={formValues[fields.STATE.key]}
          onChange={() => handleFormChange(fields.STATE)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={3}>
        <LightTextField
          required
          label={fields.COUNTRY.label}
          value={formValues[fields.COUNTRY.key]}
          onChange={() => handleFormChange(fields.COUNTRY)}
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
    <Grid container spacing={1} className={classes.container}>
      <Grid container item xs={4}>
        <LightTextField
          label={fields.SICKNESSSTATUS.label + " *"}
          select
          value={formValues[fields.SICKNESSSTATUS.key]}
          onChange={handleFormChange(fields.SICKNESSSTATUS)}
          variant="outlined"
        >
          <MenuItem key="sick" value={sicknessStatus.SICK}>
            Yes, I am sick
          </MenuItem>
          <MenuItem key="not sick" value={sicknessStatus.NOT_SICK}>
            No, I am not sick
          </MenuItem>
          <MenuItem key="recovered" value={sicknessStatus.RECOVERED}>
            No, I have recovered
          </MenuItem>
        </LightTextField>
      </Grid>

      <Grid container item xs={8}>
        <LightTextField
          label={fields.TESTEDSTATUS.label + " *"}
          select
          value={formValues[fields.TESTEDSTATUS.key]}
          onChange={handleFormChange(fields.TESTEDSTATUS)}
          variant="outlined"
        >
          <MenuItem key="positive" value={testStatus.POSITIVE}>
            Yes, tested positive
          </MenuItem>
          <MenuItem key="negative" value={testStatus.NEGATIVE}>
            Yes, tested negative
          </MenuItem>
          <MenuItem key="not tested" value={testStatus.NOT_TESTED}>
            No, I have not tested
          </MenuItem>
        </LightTextField>
      </Grid>
      <div style={{ display: errorMsg.display }} className={styles.errorMsg}>
        Please complete the following fields: {errorMsg.required}
      </div>
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
            style={{ color: "#ffffff80", fontSize: 10 }}
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
