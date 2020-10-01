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
      setVisibility("hidden");
    } else {
      setVisibility("visible");
    }
    updateMyStory(event.target.value);
  };

  const handleSubmit = (event, route) => {
    dispatch(setMyStory(myStory));

    props.history.push(route, { from: "shareBtn" });
  };

  return (
    <>
      <div className={classNames("home", styles.home)}>
        <h1 className="title">Share your pandemic experience!</h1>
        <p>
          COVID-19 has affected everyone. Sick or healthy, we've all had a
          pandemic experience. Whether illness, isolation or innovation, put
          your story on the map, see how you compare to others, share new
          insights, join your planet!
        </p>
        <div>
          <TextField
            id="outlined-multiline-static"
            placeholder="Type your story here!"
            multiline
            rowsMax={3}
            value={myStory}
            onChange={handleChange}
            className={classNames("textarea", styles.textarea)}
            variant="outlined"
          />
        </div>
        <div className={classNames("btnGroup", styles.btnGroup)}>
          <Fab
            style={{ background: "#9206FF", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={(e) => handleSubmit(e, paths.consent)}
            variant="extended"
          >
            SHARE MY STORY
          </Fab>
          <Button
            onClick={() =>
              props.history.push(paths.consent, { from: "skipBtn" })
            }
            className={classNames("skipBtn", styles.skipBtn)}
            style={{ visibility: visibility }}
          >
            skip and continue
          </Button>
        </div>
      </div>
      <div className={classNames("background", styles.background)} />
      <SimpleMap draggable={draggableMap} />
    </>
  );
}
