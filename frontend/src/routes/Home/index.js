import React, { useEffect } from "react";
import { TextField, Fab, Button } from "@material-ui/core";
import classNames from "classnames";
import styles from "./styles.module.css";
import { useSelector, useDispatch } from "react-redux";
import { submitStory } from "actions/story";
import Map from "../../components/Map/index";
import paths from "routes/paths";

export default function Home(props) {
  const [myStory, setMyStory] = React.useState("");
  const { story } = useSelector((state) => state.story);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (!story || !story["myStory"]) {
  //     setMyStory("");
  //   } else {
  //     setMyStory(story["myStory"]);
  //   }
  // }, [dispatch, story]);

  const handleChange = (event) => {
    setMyStory(event.target.value);
  };

  const handleSubmit = () => {
    // if (story["myStory"] !== myStory) {
    //   story["myStory"] = myStory;
    // const dto = {
    //   story,
    //   travels: [],
    //   closeContacts: [],
    // };
    // dispatch(submitStory(dto));
    // }

    props.history.push(paths.myStory);
  };

  return (
    <>
      <h1 className="title">
        We want to learn from your experience to stop the pandemic.
      </h1>
      <p className="subtitle">
        We all have a COVID-19 story. Share your COVID-19 story now…
      </p>
      <TextField
        id="outlined-multiline-static"
        placeholder="Tell a little about yourself, how you think you got sick and what the experience has been like"
        multiline
        rowsMax={10}
        value={myStory}
        onChange={handleChange}
        className={classNames("textarea", styles.textarea)}
        variant="filled"
      />
      <Fab
        style={{ background: "#0559FD", color: "white" }}
        aria-label="add"
        size="medium"
        onClick={handleSubmit}
        variant="extended"
      >
        SHARE MY STORY
      </Fab>
      <Fab
        style={{ background: "#9206FF", color: "white" }}
        aria-label="add"
        size="medium"
        onClick={() => props.history.push(paths.signUp)}
        variant="extended"
      >
        LEARN MORE
      </Fab>
      <Button
        style={{ color: "white" }}
        onClick={() => props.history.push(paths.onboard)}
      >
        skip and continue as guest
      </Button>
      {/* <Map></Map */}
    </>
  );
}
