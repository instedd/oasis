import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import styles from "./styles.module.css";
import { getStorySuggestions, fetchStory } from "actions/story";
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
    href: paths.symptoms,
    classes: classNames("MuiFab-extended assessment", styles.assessment),
  },
];

function Dashboard(props) {
  const [open, setOpen] = React.useState(false);
  const { story, status } = useSelector((state) => state.story);
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
    confirmed: null,
    deaths: null,
    recovered: null,
  });

  useEffect(() => {
    fetch("https://covid19api.herokuapp.com/latest")
      .then((res) => res.json())
      .then((result) => setData(result));
  }, []);

  return (
    <div className={styles.root}>
      {status.type === LOADING || !story ? (
        status.detail
      ) : (
        <>
          <div className={classNames(styles.box, styles.top, styles.left)}>
            <div className="status-list">
              <div className="row status-item">
                <span
                  className={styles.dot}
                  style={{ background: statusMapping[story.sick].color }}
                />
                {statusMapping[story.sick].name}
              </div>
              <div className="row status-item">
                <span
                  className={styles.dot}
                  style={{ background: statusMapping[story.tested].color }}
                />
                {statusMapping[story.tested].name}
              </div>
              <div></div>
            </div>
          </div>
          <div className={classNames(styles.box, styles.top, styles.right)}>
            <h3>LATEST UPDATE</h3>
            <div>
              <div>COVID-19 Cases: {data.confirmed}</div>
              <div>Total Deaths: {data.deaths}</div>
              <div>Total Recovered: {data.recovered}</div>
            </div>
          </div>
          <div
            className={classNames(
              styles.box,
              styles.bottom,
              styles.left,
              styles.wrapper
            )}
          >
            <h3>SUGGESTIONS</h3>
            <div>Stay at home</div>
            {getStorySuggestions(story).map((suggestion) => (
              <Link
                href={suggestion.site}
                {...(suggestion.color
                  ? { style: { color: suggestion.color } }
                  : {})}
                target="_blank"
              >
                {suggestion.text}
              </Link>
            ))}
          </div>
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
                onClick={() => props.history.push(action.href)}
              ></SpeedDialAction>
            ))}
          </SpeedDial>
        </>
      )}
    </div>
  );
}
export default Dashboard;
