import {
  Link,
  Collapse,
  IconButton,
  FormControl,
  Select,
  ListItemText,
  Checkbox,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import styles from "./styles.module.css";
import { fetchStory, submitMyStory } from "actions/story";
import { getStoryResources } from "actions/resources";
import { LOADING } from "actions/types";
import { useLocation } from "react-router-dom";
import api from "utils";
import Map from "components/Map";
import { fields, initialFieldsState } from "./fields";
import Text from "text.json";

const professions = Text["Profession"];
const medicalConditions = Text["Medical Conditions"];

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
  // This myStory is only temporarily fetched from state to check whether it's needed to submit myStory
  // For uses in components, use story.latestMyStory
  const { myStory, story, status } = useSelector((state) => {
    return state.story;
  });

  let location = useLocation();
  const [draggableMap, setDraggableMap] = useState(false);
  const [expanded, setExpanded] = useState(
    window.screen.width > 1024 ? true : false
  );

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    let shouldDragMap = draggableMapRoutes.includes(location.pathname);
    if (shouldDragMap !== draggableMap) {
      setDraggableMap(draggableMapRoutes.includes(location.pathname));
    }
  }, [location, draggableMap, setDraggableMap, draggableMapRoutes]);

  useEffect(() => {
    if (!story) dispatch(fetchStory());
  }, [dispatch, story]);

  useEffect(() => {
    if (story && myStory && myStory.length) {
      dispatch(submitMyStory(story.id, myStory));
    }
  }, [dispatch, story, myStory]);

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
    <div>
      <TextField
        required
        id={fields.AGE.key}
        label={fields.AGE.label}
        type="number"
        value={formValues[fields.AGE.key]}
        onChange={handleFormChange(fields.AGE)}
        InputProps={{ inputProps: { min: 0 } }}
      />
      <Select
        id={fields.SICKNESS.key}
        label={fields.SICKNESS.label}
        value={formValues[fields.SICKNESS.key]}
        onChange={handleFormChange(fields.SICKNESS)}
        InputLabelProps={{
          shrink: formValues[fields.SICKNESS.key] === null ? false : true,
        }}
      >
        <MenuItem value={"sick"}>Yes, I am sick</MenuItem>
        <MenuItem value={"notSick"}>No, I am not sick</MenuItem>
        <MenuItem value={"recovered"}>No, I have recovered</MenuItem>
      </Select>
      <Select
        id={fields.TESTED.key}
        label={fields.TESTED.label}
        value={formValues[fields.TESTED.key]}
        onChange={handleFormChange(fields.TESTED)}
        InputLabelProps={{
          shrink: formValues[fields.TESTED.key] === null ? false : true,
        }}
      >
        <MenuItem value={"positive"}>Yes, I have tested positive</MenuItem>
        <MenuItem value={"negative"}>Yes, I have tested negative</MenuItem>
        <MenuItem value={"notTested"}>No, I have not tested</MenuItem>
      </Select>
      <Select
        id={fields.SEX.key}
        label={fields.SEX.label}
        value={formValues[fields.SEX.key]}
        onChange={handleFormChange(fields.SEX)}
        InputLabelProps={{
          shrink: formValues[fields.SEX.key] === null ? false : true,
        }}
      >
        <MenuItem value={"male"}>Male</MenuItem>
        <MenuItem value={"female"}>Female</MenuItem>
        <MenuItem value={"other"}>Other</MenuItem>
        <MenuItem>I prefer not to state</MenuItem>
      </Select>

      <Select
        label={fields.COUNTRY_OF_ORIGIN.label}
        value={formValues[fields.COUNTRY_OF_ORIGIN.key]}
        onChange={handleFormChange(fields.COUNTRY_OF_ORIGIN)}
        InputLabelProps={{
          shrink: formValues[fields.SEX.key] === null ? false : true,
        }}
      >
        {countries.map((option) => (
          <MenuItem key={option.name} value={option.name}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
      <Select
        label={fields.PROFESSION.label}
        value={formValues[fields.PROFESSION.key]}
        onChange={handleFormChange(fields.PROFESSION)}
      >
        {professions.map((option) => (
          <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      <FormControl>
        <Select
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
        </Select>
      </FormControl>
    </div>
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
          {profileBar()}
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
