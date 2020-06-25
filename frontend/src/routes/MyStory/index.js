import React from "react";
import { TextField, Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import classNames from "classnames";
import styles from "./styles.module.css";

export default function MyStory(props) {
  const [story, setStory] = React.useState("");

  const handleChange = (event) => {
    setStory(event.target.value);
  };

  return (
    <>
      <h1 className="title">MY COVID-19 STORY</h1>
      <p className="subtitle">Your COVID-19 story in your own words</p>
      <TextField
        id="outlined-multiline-static"
        placeholder="Tell a little about yourself, how you think you got sick and what the experience has been like"
        multiline
        rowsMax={10}
        value={story}
        onChange={handleChange}
        className={classNames("textarea", styles.textarea)}
        variant="outlined"
      />
      <Fab
        style={{ background: "#EA2027", marginTop: "1.5rem" }}
        aria-label="add"
        size="medium"
        className="fab"
        variant="extended"
      >
        SHARE MY STORY
      </Fab>
      <Fab
        style={{ background: "#9206FF" }}
        aria-label="add"
        onClick={() => props.history.push("/dashboard")}
        size="medium"
        className="fab back-btn"
      >
        <ArrowLeftIcon />
      </Fab>
    </>
  );
}
