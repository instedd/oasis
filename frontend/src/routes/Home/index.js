import { TextField, Fab, Button } from "@material-ui/core";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import SimpleMap from "components/SimpleMap";
import paths from "routes/paths";
import styles from "./styles.module.css";
import { setMyStory } from "../../actions/story";

export default function Home(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();

  const [myStory, updateMyStory] = useState("");
  const [draggableMap, setDraggableMap] = useState(false);
  const [visibility, setVisibility] = useState("visible");

  let location = useLocation();

  useEffect(() => {
    let shouldDragMap = draggableMapRoutes.includes(location.pathname);
    if (shouldDragMap !== draggableMap) {
      setDraggableMap(draggableMapRoutes.includes(location.pathname));
    }
  }, [location, draggableMap, setDraggableMap, draggableMapRoutes]);

  const handleChange = (event) => {
    if (event.target.value) {
      console.log(true);
      setVisibility("hidden");
    } else {
      console.log(false);
      setVisibility("visible");
    }
    updateMyStory(event.target.value);
  };

  const handleSubmit = (event, route) => {
    dispatch(setMyStory(myStory));

    props.history.push(route);
  };

  return (
    <>
      <div className={classNames("home", styles.home)}>
        <h1 className="title">
          We want to learn from your experience to stop the pandemic.
        </h1>
        <div>
          <TextField
            id="outlined-multiline-static"
            placeholder="Everyone have been affected by covid in some way. We all have a covid story, share yours!"
            multiline
            rowsMax={10}
            value={myStory}
            onChange={handleChange}
            className={classNames("textarea", styles.textarea)}
            variant="filled"
            style={{ color: "black" }}
          />
          <Button
            onClick={() =>
              props.history.push(paths.onboard, { onboard: false })
            }
            className={classNames("skipBtn", styles.skipBtn)}
            style={{ visibility: visibility }}
          >
            skip and continue as guest
          </Button>
        </div>
        <div className={classNames("btnGroup", styles.btnGroup)}>
          <Fab
            style={{ background: "#0559FD", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={(e) => handleSubmit(e, paths.consent)}
            variant="extended"
          >
            SHARE MY STORY
          </Fab>
          <Fab
            style={{ background: "#9206FF", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={(e) => handleSubmit(e, paths.signUp)}
            variant="extended"
          >
            LEARN MORE
          </Fab>
        </div>
      </div>
      <div className={classNames("background", styles.background)} />
      <SimpleMap draggable={draggableMap} />
    </>
  );
}
