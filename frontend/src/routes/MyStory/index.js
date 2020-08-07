import React, { useEffect } from "react";
import { TextField, Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import classNames from "classnames";
import styles from "./styles.module.css";
import { useSelector, useDispatch } from "react-redux";
import { submitStory } from "actions/story";

export default function MyStory(props) {
  const [myStory, setMyStory] = React.useState("");
  const { story } = useSelector((state) => state.story);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!story || !story["myStory"]) {
      setMyStory("");
    } else {
      setMyStory(story["myStory"]);
    }
  }, [dispatch, story]);

  const handleChange = (event) => {
    setMyStory(event.target.value);
  };

  const handleSubmit = () => {
    if (story["myStory"] !== myStory) {
      story["myStory"] = myStory;
      const dto = {
        story,
        travels: [],
        closeContacts: [],
      };
      dispatch(submitStory(dto));
    }

    props.history.push("/dashboard");
  };

  return (
    <>
      <h1 className="title">MY COVID-19 STORY</h1>
      <p className="subtitle">Your COVID-19 story in your own words</p>
      <TextField
        id="outlined-multiline-static"
        placeholder="We want to learn from your experience to help overcome the pandemic. Even if you aren’t sick, we all have a COVID story. Share Your COVID-19 Story*"
        multiline
        rowsMax={10}
        value={myStory}
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
        onClick={handleSubmit}
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
