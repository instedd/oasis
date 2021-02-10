import {
  ListItemText,
  Checkbox,
  MenuItem,
  TextField,
  Grid,
  Button,
} from "@material-ui/core";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import styles from "./styles.module.css";
import { fetchStory, submitMyStory, submitStory } from "actions/story";
import { LOADING } from "actions/types";
import { useLocation } from "react-router-dom";
import api from "utils";
import Map from "components/Map";
import { fields, initialFieldsState } from "./fields";
import Text from "text.json";
import { makeStyles } from "@material-ui/core/styles";

const professions = Text["Profession"];
const medicalConditions = Text["Medical Conditions"];

const useStyles = makeStyles(() => ({
  profileBar: {
    width: 600,
    bottom: 0,
    padding: "0px 30px 40px 20px",
    zIndex: 2,
    position: "absolute",
    background: "rgba(0, 0, 0, 0.6)",
    "& .MuiMenuItem-root": {
      whiteSpace: "normal",
    },
  },
  // eslint-disable-next-line
  ["@media (max-width: 780px)"]: {
    profileBar: {
      width: "100%",
      left: 0,
      right: 0,
      margin: 0,
    },
  },
  submitBtn: {
    background: "var(--primary) !important",
    color: "white",
    verticalAlign: "center",
    width: "100%",
  },
  root: {
    "label + &": {
      color: "white",
    },
  },
}));

function Dashboard(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();
  const [countries, setCountries] = useState([]);
  const [formValues, setFormValues] = useState(initialFieldsState());
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const [errorMsg, setErrorMsg] = useState({ display: "none", required: null });
  const [barDisplay, setBarDisplay] = useState(false);
  // This myStory is only temporarily fetched from state to check whether it's needed to submit myStory
  // For uses in components, use story.latestMyStory
  const { story, status, tempStory, tempMyStory } = useSelector((state) => {
    return state.story;
  });

  let location = useLocation();
  const [draggableMap, setDraggableMap] = useState(false);

  useEffect(() => {
    if (tempStory) {
      const nextPage = paths.dashboard;
      const dto = {
        story: tempStory,
        nextPage,
        travels: [],
        closeContacts: [],
      };
      dispatch(submitStory(dto));
    } else if (!story) {
      dispatch(fetchStory());
    } else if (story && tempMyStory && tempMyStory.length) {
      dispatch(submitMyStory(story.id, tempMyStory));
    }
    if (story) {
      const required = ["age", "sex", "profession"];
      Object.keys(story).forEach((key) => {
        if (required.includes(key) && story[key] === null) {
          setBarDisplay(true);
        }
      });
    }
    // eslint-disable-next-line
  }, [story, tempMyStory]);

  useEffect(() => {
    let shouldDragMap = draggableMapRoutes.includes(location.pathname);
    if (shouldDragMap !== draggableMap) {
      setDraggableMap(draggableMapRoutes.includes(location.pathname));
    }
  }, [location, draggableMap, setDraggableMap, draggableMapRoutes]);

  const handleClick = () => {
    setOpen(!open);
  };

  const [storyList, setStoryList] = useState([]);

  useEffect(() => {
    api(`stories/explore`, {
      method: "GET",
    }).then((stories) => {
      setStoryList(stories);
    });
  }, []);

  useEffect(() => {
    fetch("https://restcountries.eu/rest/v2/all?fields=name")
      .then((res) => res.json())
      .then(
        (result) => {
          setCountries(result);
        },
        () => {}
      );
  }, []);

  const handleFormChange = (field) => (event) => {
    const intFields = [fields.AGE];
    const key = field.key;

    if (intFields.includes(field)) {
      if (/^\d+$/.test(event.target.value))
        setFormValues({ ...formValues, [key]: parseInt(event.target.value) });
      else setFormValues({ ...formValues, [key]: "" });
    } else {
      setFormValues({ ...formValues, [key]: event.target.value });
    }
  };

  const handleSubmit = () => {
    let tempList = [];
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === null && key !== "countryOfOrigin")
        tempList.push(key);
    });
    if (tempList.length > 0) {
      setErrorMsg({
        display: "block",
        required: tempList.join(", "),
      });
    } else {
      const { ...newStory } = formValues;
      Object.assign(story, newStory);

      const nextPage = paths.dashboard;

      const dto = {
        story: story,
        nextPage,
        travels: [],
        closeContacts: [],
      };

      dispatch(submitStory(dto, true));
      setBarDisplay(false);
    }
  };

  const actions = [
    {
      name: "MY STORIES", //hasMyStory ? "UPDATE MY STORY" : "ADD MY STORY",
      href: paths.storyHistory,
      //paths.myStory,
      classes: "MuiFab-extended",
    },
    {
      name: "UPDATE MY STATUS",
      href: paths.onboard,
      state: { onboard: false },
      classes: classNames("MuiFab-extended assessment", styles.assessment),
    },
    {
      name: "EDIT MY PROFILE",
      href: paths.criticalQuestions,
      classes: classNames("MuiFab-extended", styles.profile),
    },
  ];

  // const userStatus = () => (
  //   <div
  //     className={classNames(styles.statusList)}
  //     style={{ textAlign: "left" }}
  //   >
  //     <div className={classNames("row", styles.statusItem)}>
  //       <span
  //         className={styles.dot}
  //         style={{ background: statusMapping[story.sick].color }}
  //       />
  //       {statusMapping[story.sick].name.toUpperCase()}
  //     </div>
  //     <div className={classNames("row", styles.statusItem)}>
  //       <span
  //         className={styles.dot}
  //         style={{ background: statusMapping[story.tested].color }}
  //       />
  //       {statusMapping[story.tested].name.toUpperCase()}
  //     </div>
  //   </div>
  // );

  // const informationHeader = () => (
  //   <div className={classNames(styles.box, styles.top, styles.header)}>
  //     {userStatus()}
  //     {/* {resources()} */}
  //   </div>
  // );

  const profileBar = () => (
    <Grid
      container
      spacing={2}
      className={classNames(classes.profileBar, styles.profileBar)}
    >
      <div
        style={{ display: errorMsg.display }}
        className={classNames(styles.errorMsg)}
      >
        Please complete the following fields: {errorMsg.required}
      </div>
      <Grid item md={3} xs={3}>
        <TextField
          required
          label={fields.AGE.label}
          value={formValues[fields.AGE.key]}
          onChange={handleFormChange(fields.AGE)}
          InputLabelProps={{
            shrink: !formValues[fields.AGE.key] ? false : true,
          }}
        />
      </Grid>
      <Grid item md={3} xs={3}>
        <TextField
          required
          select
          label={fields.SEX.label}
          value={formValues[fields.SEX.key]}
          onChange={handleFormChange(fields.SEX)}
        >
          <MenuItem value={"male"} key={"male"}>
            Male
          </MenuItem>
          <MenuItem value={"female"} key={"female"}>
            Female
          </MenuItem>
          <MenuItem value={"other"} key={"other"}>
            Other
          </MenuItem>
          <MenuItem value={"not stated"} key={"not stated"}>
            I prefer not to state
          </MenuItem>
        </TextField>
      </Grid>
      <Grid item md={4} xs={4}>
        <TextField
          select
          label={fields.COUNTRY_OF_ORIGIN.label}
          value={formValues[fields.COUNTRY_OF_ORIGIN.key]}
          onChange={handleFormChange(fields.COUNTRY_OF_ORIGIN)}
        >
          {countries.map((option) => (
            <MenuItem key={option.name} value={option.name}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item md={2} xs={2} style={{ marginTop: "auto" }}>
        <Button className={classes.submitBtn} onClick={() => handleSubmit()}>
          Submit
        </Button>
      </Grid>
      <Grid item md={6} xs={5}>
        <TextField
          required
          select
          label={fields.PROFESSION.label}
          value={formValues[fields.PROFESSION.key]}
          onChange={handleFormChange(fields.PROFESSION)}
        >
          {professions.map((option) => (
            <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item md={6} xs={5}>
        <TextField
          select
          label={fields.MEDICAL_CONDITIONS.label}
          value={formValues[fields.MEDICAL_CONDITIONS.key]}
          onChange={handleFormChange(fields.MEDICAL_CONDITIONS)}
          SelectProps={{
            multiple: true,
            renderValue: (selected) => selected.join(", "),
          }}
        >
          {medicalConditions.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox
                checked={
                  formValues[fields.MEDICAL_CONDITIONS.key].indexOf(name) > -1
                }
              />
              <ListItemText
                primary={name}
                className={classNames(
                  "checkbox-label",
                  styles["checkbox-label"]
                )}
              />
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );

  // <div className={classNames(styles.right)}>{informationHeader()}</div>
  //put after Map

  return (
    <div className={styles.root}>
      {status.type === LOADING || !story ? (
        status.detail
      ) : (
        <>
          <Map
            draggable={draggableMap}
            userStory={story}
            latestMyStory={tempMyStory ? tempMyStory : story.latestMyStory}
            storyList={storyList}
          />
          {barDisplay ? profileBar() : ""}
          <SpeedDial
            ariaLabel="Daily actions"
            className={classNames("speeddial", styles.speeddial)}
            icon={<SpeedDialIcon />}
            onClick={handleClick}
            open={open}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.name}
                tooltipTitle={action.name}
                className={action.classes}
                onClick={() =>
                  props.history.push(action.href, action.state || {})
                }
              ></SpeedDialAction>
            ))}
          </SpeedDial>
        </>
      )}
    </div>
  );
}
export default Dashboard;
