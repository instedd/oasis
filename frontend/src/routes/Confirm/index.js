import { Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import classNames from "classnames";
import Wrapper from "components/Wrapper";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus, testStatus } from "routes/types";
import { setTestedStatus } from "../../actions/story";
import styles from "./styles.module.css";

export default function Confirm({ history }) {
  const sick = useSelector((state) => state.story.sick);

  const dispatch = useDispatch();
  const handleClick = (selected) => () => {
    dispatch(setTestedStatus(selected));
    history.push(paths.criticalQuestions);
  };

  return (
    <>
      <h1 className={classNames("title", styles.title)}>
        HAVE YOUR BEEN TESTED FOR COVID-19?
      </h1>

      <div className={classNames("btn-group", styles.buttons)}>
        <Fab
          style={{ background: "#EA2027" }}
          size="large"
          className="fab"
          variant="extended"
          onClick={handleClick(testStatus.POSITIVE)}
        >
          <span>YES, TESTED POSITIVE</span>
        </Fab>
        <Fab
          style={{ background: "#9206FF" }}
          size="large"
          className="fab"
          variant="extended"
          onClick={handleClick(testStatus.NEGATIVE)}
        >
          <span>YES, TESTED NEGATIVE</span>
        </Fab>
        <Fab
          style={{ background: "#0559FD" }}
          size="large"
          className="fab"
          variant="extended"
          onClick={handleClick(testStatus.NOT_TESTED)}
        >
          <span>NO, I HAVE NOT</span>
        </Fab>
      </div>
      <Fab
        style={{ background: "#9206FF" }}
        size="medium"
        className="fab back-btn"
        onClick={() =>
          history.push(
            sick === sicknessStatus.SICK ? paths.alert : paths.onboard
          )
        }
      >
        <ArrowLeftIcon />
      </Fab>
    </>
  );
}
