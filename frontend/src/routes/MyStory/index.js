import React, { useState } from "react";
import { TextField, Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import MapIcon from "@material-ui/icons/Map";
import classNames from "classnames";
import styles from "./styles.module.css";
import { useSelector, useDispatch } from "react-redux";
import { submitMyStory } from "actions/story";
import paths from "routes/paths";

export default function MyStory(props) {
  const [myStory, setMyStory] = useState("");
  const { story } = useSelector((state) => state.story);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setMyStory(event.target.value);
  };

  const handleSubmitStory = () => {
    if (!myStory || myStory.length === 0) {
      document.getElementById("warning").innerHTML =
        "Your story is empty. Please write a few words to sumbit.";
    } else {
      document.getElementById("warning").innerHTML = "";
      var storyId = story.id;
      dispatch(submitMyStory(storyId, myStory));
      props.history.push(paths.storyHistory);
    }
  };

  return (
    <>
      <h1 className="title">SHARE MY COVID-19 STORY</h1>
      <div id="warning" style={{ marginBottom: "20px", color: "red" }}></div>
      <TextField
        id="outlined-multiline-static"
        placeholder="We want to learn from your experience to help overcome the pandemic. We all have a COVID-19 story, share yours!"
        multiline
        rowsMax={10}
        value={myStory}
        onChange={handleChange}
        className={classNames("textarea", styles.textarea)}
        variant="outlined"
      />
      <Fab
        style={{
          background: "#EA2027",
          width: 200,
          margin: "1.5rem auto 0 auto",
        }}
        aria-label="add"
        size="medium"
        className="fab"
        variant="extended"
        onClick={handleSubmitStory}
      >
        SHARE MY STORY
      </Fab>
      <Fab
        style={{ background: "#9206FF" }}
        aria-label="add"
        onClick={() => props.history.push(paths.storyHistory)}
        size="medium"
        className="fab back-btn"
      >
        <ArrowLeftIcon />
      </Fab>
      <Fab
        style={{ background: "#EA2027" }}
        aria-label="Go to next page"
        size="medium"
        className="fab next-btn"
        onClick={() => props.history.go(paths.dashboard)}
      >
        <MapIcon />
      </Fab>
    </>
  );
}
