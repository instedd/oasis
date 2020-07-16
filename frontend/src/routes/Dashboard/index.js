import {
  Link,
  IconButton,
  Collapse,
  Grid,
  AppBar,
  Toolbar,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import styles from "./styles.module.css";
import { fetchStory } from "actions/story";
import { getStoryResources } from "actions/resources";
import { LOADING } from "actions/types";

const statusMapping = {
  [testStatus.POSITIVE]: { name: "Tested Positive", color: "red" },
  [testStatus.NEGATIVE]: { name: "Tested Negative", color: "purple" },
  [testStatus.NOT_TESTED]: { name: "Not Tested", color: "blue" },
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

const actions = [
  { name: "ADD MY STORY", href: paths.myStory, classes: "MuiFab-extended" },
  {
    name: "DAILY ASSESSMENT",
    href: paths.onboard,
    state: { onboard: true },
    classes: classNames("MuiFab-extended assessment", styles.assessment),
  },
];

function Dashboard(props) {
  const [open, setOpen] = React.useState(false);
  const { story, status } = useSelector((state) => state.story);
  const [statusExpanded, setStatusExpanded] = React.useState(true);
  const [updateExpanded, setUpdateExpanded] = React.useState(true);
  const [resourceExpanded, setResourceExpanded] = React.useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!story) dispatch(fetchStory());
  }, [dispatch, story]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [data, setData] = useState({
    confirmed: {},
    deaths: {},
    recovered: {},
    updatedAt: null,
  });

  const [newData, setNewData] = useState({
    data: {},
  });

  useEffect(() => {
    fetch("https://covid19api.herokuapp.com/")
      .then((res) => res.json())
      .then((result) => setData(result));
  }, []);

  useEffect(() => {
    fetch("https://covid-api.com/api/reports/total")
      .then((res) => res.json())
      .then((result) => setNewData(result));
  }, []);

  const userStatus = () => (
    <AppBar position="fixed">
      <Toolbar>
        <div className={classNames(styles.statusItem)}>
          <span
            className={styles.dot}
            style={{ background: statusMapping[story.sick].color }}
          />
          {statusMapping[story.sick].name.toUpperCase()}
        </div>
        <div className={classNames(styles.statusItem)}>
          <span
            className={styles.dot}
            style={{ background: statusMapping[story.tested].color }}
          />
          {statusMapping[story.tested].name.toUpperCase()}
        </div>
      </Toolbar>
    </AppBar>
  );

  const latestUpdate = () => (
    <div className={classNames(styles.box, styles.updates)}>
      <IconButton
        onClick={() => setUpdateExpanded(!updateExpanded)}
        aria-expanded={updateExpanded}
        aria-label="show updates"
      >
        <h5>LATEST TOTALS</h5>
        {updateExpanded ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
      <Collapse in={updateExpanded} timeout="auto" unmountOnExit>
        <div className="row">
          <div className={classNames(styles.totalItem)}>
            ACTIVES
            <div className={classNames(styles.totalItemNum)}>
              {newData.data.confirmed &&
                newData.data.confirmed.toLocaleString()}
            </div>
            <div className={classNames(styles.totalItemTrend)}>
              {"+" +
                String(
                  newData.data.confirmed_diff / newData.data.confirmed
                ).substring(0, 6) +
                "%"}
            </div>
          </div>
          <div className={classNames(styles.totalItem)}>
            DEATHS
            <div className={classNames(styles.totalItemNum)}>
              {newData.data.deaths && newData.data.deaths.toLocaleString()}
            </div>
            <div className={classNames(styles.totalItemTrend)}>
              {"+" +
                String(
                  newData.data.deaths_diff / newData.data.deaths
                ).substring(0, 6) +
                "%"}
            </div>
          </div>
          <div className={classNames(styles.totalItem)}>
            RECOVERED
            <div className={classNames(styles.totalItemNum)}>
              {newData.data.recovered &&
                newData.data.recovered.toLocaleString()}
            </div>
            <div className={classNames(styles.totalItemTrend)}>
              {"+" +
                String(
                  newData.data.recovered_diff / newData.data.recovered
                ).substring(0, 6) +
                "%"}
            </div>
          </div>
          <div className={classNames(styles.totalItem)}>
            LATEST UPDATE
            <div className={classNames(styles.totalItemNum)}>
              {newData.data.last_update}
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );

  const resources = () => (
    <div className={classNames(styles.box, styles.header)}>
      <IconButton
        onClick={() => setResourceExpanded(!resourceExpanded)}
        aria-expanded={resourceExpanded}
        aria-label="show resources"
      >
        <h5>MY RESOURCES</h5>{" "}
        {resourceExpanded ? <ExpandLess /> : <ExpandMore />}
      </IconButton>

      <Collapse in={resourceExpanded} timeout="auto" unmountOnExit>
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
    </div>
  );

  const modules = () => (
    <div className={classNames(styles.grid)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {latestUpdate()}
        </Grid>
        <Grid item xs={12}>
          {resources()}
        </Grid>
      </Grid>
    </div>
  );

  return (
    <div className={styles.root}>
      {status.type === LOADING || !story ? (
        status.detail
      ) : (
        <>
          {userStatus()}
          {modules()}
          <SpeedDial
            ariaLabel="Daily actions"
            className={classNames("speeddial", styles.speeddial)}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
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
