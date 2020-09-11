import Link from "@material-ui/core/Link";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import Collapse from "@material-ui/core/Collapse";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import styles from "./styles.module.css";
import { fetchStory } from "actions/story";
import { getStoryResources } from "actions/resources";
import { LOADING } from "actions/types";
import { useLocation } from "react-router-dom";
import api from "utils";
import Map from "components/Map";

const statusMapping = {
  [testStatus.POSITIVE]: { name: "Tested Positive", color: "red" },
  [testStatus.NEGATIVE]: { name: "Tested Negative", color: "purple" },
  [testStatus.NOT_TESTED]: { name: "Not Tested", color: "blue" },
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

function Dashboard(props, { draggableMapRoutes = [] }) {
  const [open, setOpen] = useState(false);
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

  const hasMyStory = story && story.latestMyStory;
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
      state: { onboard: true },
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

  return (
    <div className={styles.root}>
      {status.type === LOADING || !story ? (
        status.detail
      ) : (
        <>
          <Map
            draggable={draggableMap}
            userStory={story}
            actives={data.confirmed && data.confirmed.toLocaleString()}
            deaths={data.deaths && data.deaths.toLocaleString()}
            recovered={data.recovered && data.recovered.toLocaleString()}
            userNum={stats.userNum && stats.userNum.toLocaleString()}
            storyNum={stats.storyNum && stats.storyNum.toLocaleString()}
          />
          {informationHeader()}
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
