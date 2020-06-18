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

  const userStatus = () => (
    <div className={classNames(styles.statusList)}>
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
      <div></div>
    </div>
  );

  const latestUpdate = () => (
    <div>
      <h3>LATEST TOTALS</h3>
      <div className="row">
        <div className={classNames(styles.totalItem)}>
          ACTIVES
          <div className={classNames(styles.totalItemNum)}>
            {data.confirmed && data.confirmed.toLocaleString()}
          </div>
        </div>
        <div className={classNames(styles.totalItem)}>
          DEATHS
          <div className={classNames(styles.totalItemNum)}>
            {data.deaths && data.deaths.toLocaleString()}
          </div>
        </div>
        <div className={classNames(styles.totalItem)}>
          RECOVERED
          <div className={classNames(styles.totalItemNum)}>
            {data.recovered && data.recovered.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const suggestions = () => (
    <div className={classNames(styles.box, styles.top, styles.header)}>
      <h3>SUGGESTIONS</h3>
      <div>Stay at home</div>
      {getStorySuggestions(story).map((suggestion) => (
        <Link
          href={suggestion.site}
          {...(suggestion.color ? { style: { color: suggestion.color } } : {})}
          target="_blank"
        >
          {suggestion.text}
        </Link>
      ))}
      {userStatus()}
      {latestUpdate()}
    </div>
  );

  return (
    <div className={styles.root}>
      {status.type === LOADING || !story ? (
        status.detail
      ) : (
        <>
          {suggestions()}
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
