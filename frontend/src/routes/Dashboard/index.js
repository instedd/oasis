import {
  Link,
  Collapse,
  IconButton,
  ListItemText,
  Checkbox,
  MenuItem,
  TextField,
  Grid,
  Button,
} from "@material-ui/core";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import styles from "./styles.module.css";
import { fetchStory, submitMyStory, submitStory } from "actions/story";
import { getStoryResources } from "actions/resources";
import { LOADING } from "actions/types";
import { useLocation } from "react-router-dom";
import api from "utils";
import Map from "components/Map";
import { fields, initialFieldsState } from "./fields";
import Text from "text.json";
import { makeStyles, withStyles } from "@material-ui/core/styles";

const professions = Text["Profession"];
const medicalConditions = Text["Medical Conditions"];

const useStyles = makeStyles((theme) => ({
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
  ["@media (max-width: 780px)"]: {
    profileBar: {
      width: "100%",
      left: 0,
      padding: "0px 40px 5rem 10px",
      right: 0,
      margin: 0,
    },
  },
  submitBtn: {
    background: "var(--primary) !important",
    color: "white",
    verticalAlign: "center",
    width: "100%",
    marginLeft: 10,
  },
  root: {
    "label + &": {
      color: "white",
    },
  },
}));

const statusMapping = {
  [testStatus.POSITIVE]: { name: "Tested Positive", color: "red" },
  [testStatus.NEGATIVE]: { name: "Tested Negative", color: "purple" },
  [testStatus.NOT_TESTED]: { name: "Not Tested", color: "blue" },
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

function Dashboard(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();
  const [countries, setCountries] = useState([]);
  const [formValues, setFormValues] = useState(initialFieldsState());
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const [errorMsg, setErrorMsg] = useState({ display: "none", required: null });
  let barDisplay = false;
  // This myStory is only temporarily fetched from state to check whether it's needed to submit myStory
  // For uses in components, use story.latestMyStory
  const { myStory, story, status, tempStory, tempMyStory } = useSelector(
    (state) => {
      return state.story;
    }
  );

  let location = useLocation();
  const [draggableMap, setDraggableMap] = useState(false);
  const [expanded, setExpanded] = useState(
    window.screen.width > 1024 ? true : false
  );

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

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

    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === null) {
        barDisplay = true;
      }
    });
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

  const [data, setData] = useState({
    confirmed: null,
    deaths: null,
    recovered: null,
  });

  const [stats, setStats] = useState({
    userNum: null,
    storyNum: null,
  });

  useEffect(() => {
    fetch("https://covid19api.herokuapp.com/latest")
      .then((res) => res.json())
      .then((result) => setData(result));
  }, []);

  useEffect(() => {
    api(`stories/all`, {
      method: "GET",
    }).then((storiesData) => {
      setStats({
        userNum: storiesData.length,
        storyNum: storiesData.filter((story) => story.latestMyStory).length,
      });
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
      setFormValues({ ...formValues, [key]: parseInt(event.target.value) });
    } else {
      setFormValues({ ...formValues, [key]: event.target.value });
    }
  };

  const handleSubmit = () => {
    let tempList = [];
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === null) tempList.push(key);
    });
    if (tempList.length > 0) {
      setErrorMsg({
        display: "block",
        required: tempList.join(", ").replace("countryOfOrigin", "citizenship"),
      });
    } else {
      const { ...newStory } = formValues;
      Object.assign(story, newStory);
      //TODO: delete this
      story.medical_conditions = [];

      const nextPage = paths.dashboard;

      const dto = {
        story: story,
        nextPage,
        travels: [],
        closeContacts: [],
      };

      dispatch(submitStory(dto, true));
      barDisplay = false;
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

  const userStatus = () => (
    <div
      className={classNames(styles.statusList)}
      style={{ textAlign: "left" }}
    >
      <div className={classNames("row", styles.statusItem)}>
        <span
          className={styles.dot}
          style={{ background: statusMapping[story.sick].color }}
        />
        {statusMapping[story.sick].name.toUpperCase()}
      </div>
      <div className={classNames("row", styles.statusItem)}>
        <span
          className={styles.dot}
          style={{ background: statusMapping[story.tested].color }}
        />
        {statusMapping[story.tested].name.toUpperCase()}
      </div>
    </div>
  );

  const LightTextField = withStyles((theme) => ({
    root: {
      color: "white",
      "& .MuiSelect-select.MuiSelect-select": {
        textAlign: "left",
      },
      borderBottom: "1px solid white",
      "& label": {
        color: "#ffffff80",
      },
      "& .MuiInputBase-root": {
        color: "#ffffff",
      },
      width: "100%",
      margin: 0,
    },
    ["@media (max-width: 780px)"]: {
      root: {
        "& label": {
          fontSize: 12,
        },
        "& .MuiSelect-select.MuiSelect-select": {
          fontSize: 12,
        },
      },
    },
  }))(TextField);

  const resources = () => (
    <>
      <div className={classNames(styles.resources)}>
        <h3>RESOURCES</h3>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {getStoryResources(story).map((resource) => (
          <Link
            href={resource.site}
            {...(resource.color ? { style: { color: resource.color } } : {})}
            target="_blank"
          >
            {resource.text}
          </Link>
        ))}
      </Collapse>
    </>
  );

  const informationHeader = () => (
    <div className={classNames(styles.box, styles.top, styles.header)}>
      {userStatus()}
      {resources()}
    </div>
  );

  const profileBar = () => (
    <Grid container spacing={2} className={classes.profileBar}>
      <div
        style={{ display: errorMsg.display }}
        className={classNames(styles.errorMsg)}
      >
        Please complete the following fields: {errorMsg.required}
      </div>
      <Grid item xs={3}>
        <LightTextField
          required
          label={fields.AGE.label}
          type="number"
          value={formValues[fields.AGE.key]}
          onChange={handleFormChange(fields.AGE)}
          InputProps={{ inputProps: { min: 0 } }}
        />
      </Grid>
      <Grid item xs={3}>
        <LightTextField
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
          <MenuItem>I prefer not to state</MenuItem>
        </LightTextField>
      </Grid>
      <Grid item xs={4}>
        <LightTextField
          required
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
        </LightTextField>
      </Grid>
      <Grid item xs={2} style={{ marginTop: "auto" }}>
        <Button className={classes.submitBtn} onClick={() => handleSubmit()}>
          Submit
        </Button>
      </Grid>
      <Grid item xs={6}>
        <LightTextField
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
        </LightTextField>
      </Grid>
      <Grid item xs={6}>
        <LightTextField
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
        </LightTextField>
      </Grid>
    </Grid>
  );

  return (
    <div className={styles.root}>
      {status.type === LOADING || !story ? (
        status.detail
      ) : (
        <>
          <Map
            draggable={draggableMap}
            userStory={story}
            latestMyStory={myStory ? myStory : story.latestMyStory}
            actives={data.confirmed && data.confirmed.toLocaleString()}
            deaths={data.deaths && data.deaths.toLocaleString()}
            recovered={data.recovered && data.recovered.toLocaleString()}
            userNum={stats.userNum && stats.userNum.toLocaleString()}
            storyNum={stats.storyNum && stats.storyNum.toLocaleString()}
          />
          {informationHeader()}
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
