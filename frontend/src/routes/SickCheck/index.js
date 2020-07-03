import { Fab } from "@material-ui/core";
import classNames from "classnames";
import React from "react";
import { useDispatch } from "react-redux";
import { sicknessStatus } from "routes/types";
import { setSickStatus } from "../../actions/story";
import styles from "./styles.module.css";
import paths from "routes/paths";

export default function SickCheck({ history }) {
  const dispatch = useDispatch();
  const handleClick = (selected) => () => {
    dispatch(setSickStatus(selected));
    // if(selected === sicknessStatus.SICK)history.push(paths.symptoms);
    // else history.push(paths.dashboard);
    history.push(paths.testcheck);
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
