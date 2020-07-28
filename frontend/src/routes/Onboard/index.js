import { Fab } from "@material-ui/core";
import classNames from "classnames";
import React from "react";
import { useDispatch } from "react-redux";
import { sicknessStatus } from "routes/types";
import { submitSick } from "../../actions/story";
import styles from "./styles.module.css";
import paths from "routes/paths";
import { fields } from "./fields";
import { useLocation } from "react-router-dom";

export default function Onboard({ history }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const story = fields;

  const handleClick = (selected) => () => {
    story.sick = selected;
    dispatch(submitSick({ story }));
    if (selected === sicknessStatus.SICK)
      history.push(paths.alert, location.state || {});
    else history.push(paths.confirm, location.state || {});
  };

  return (
    <>
      <h1 className="title">MY COVID STORY</h1>
      <div className={classNames("btn-group", styles.buttons)}>
        <Fab
          style={{ background: "#EA2027" }}
          variant="extended"
          className="fab sick-btn"
          onClick={handleClick(sicknessStatus.SICK)}
        >
          <span>I AM SICK</span>
        </Fab>
        <Fab
          style={{ background: "#9206FF" }}
          variant="extended"
          className="fab not-sick-btn"
          onClick={handleClick(sicknessStatus.NOT_SICK)}
        >
          <span>I AM NOT SICK</span>
        </Fab>
        <Fab
          style={{ background: "#0559FD" }}
          variant="extended"
          className="fab not-sick-btn"
          onClick={handleClick(sicknessStatus.RECOVERED)}
        >
          <span>I AM RECOVERED</span>
        </Fab>
      </div>
    </>
  );
}
