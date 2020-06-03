import React from "react";
import { Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

import Wrapper from "components/Wrapper";
import styles from "./styles.module.css";
import Text from "text.json";

const texts = Text["Warning Signs"].texts;
const listIndex = Text["Warning Signs"].listIndex;
const linkIndex = Text["Warning Signs"].linkIndex;

export default function Alert(props) {
  return (
    <>
      <h1 className={styles.title}>WARNING</h1>
      <div className={styles.warnings}>
        <ul>
          {texts.map((x, i) => {
            if (listIndex.indexOf(i) >= 0) return <li key={i}>{x}</li>;
            else if (linkIndex.indexOf(i) >= 0)
              return (
                <a key={i} href={x} target="_blank">
                  {x}
                </a>
              );
            else return <p key={i}>{x}</p>;
          })}
        </ul>
        <Fab
          style={{ background: "#9206FF" }}
          aria-label="Go to next page"
          onClick={() => props.history.push("/onboard")}
          size="medium"
          className="fab back-btn"
        >
          <ArrowLeftIcon />
        </Fab>
        <Fab
          style={{ background: "#EA2027" }}
          aria-label="Go to previous page"
          onClick={() => props.history.push("/confirm")}
          size="medium"
          className="fab next-btn"
        >
          <ArrowRightIcon />
        </Fab>
      </div>
    </>
  );
}
