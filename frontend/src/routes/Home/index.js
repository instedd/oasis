import { TextField, Fab, Button } from "@material-ui/core";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import SimpleMap from "components/SimpleMap";
import paths from "routes/paths";
import styles from "./styles.module.css";
import api from "utils";
import { SET_MY_STORY } from "actions/types";
import { setMyStory } from "../../actions/story";

export default function Home(props, { draggableMapRoutes = [] }) {
  const dispatch = useDispatch();

  const [myStory, updateMyStory] = useState("");
  const [draggableMap, setDraggableMap] = useState(false);
  const [userNum, setUserNum] = useState(0);
  const [storyNum, setStoryNum] = useState(0);

  const fetchStoriesData = async (scope) => {
    const body = await api(`stories/all`, {
      method: "GET",
    });

    return body;
  };

  const getRandomFloat = () => {
    return Math.random() * (Math.random() > 0.5 ? -1 : 1);
  };
  const isInRange = (lat, lng) => {
    return lat && lat <= 90 && lat >= -90 && lng && lng <= 180 && lng >= -180;
  };

  const storiesToGeoJson = async (stories) => {
    stories = stories.filter(
      (story) =>
        story && isInRange(story.latitude, story.longitude) && !story.spam
    );

    let features = stories.map((story) => {
      let { latitude, longitude, ...properties } = story;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            longitude + getRandomFloat(),
            latitude + getRandomFloat(),
          ],
        },
        properties: properties,
      };
    });

    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  const storiesData = fetchStoriesData();

  let location = useLocation();

  useEffect(() => {
    let shouldDragMap = draggableMapRoutes.includes(location.pathname);
    if (shouldDragMap !== draggableMap) {
      setDraggableMap(draggableMapRoutes.includes(location.pathname));
    }
  }, [location, draggableMap, setDraggableMap, draggableMapRoutes]);

  const handleChange = (event) => {
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
            placeholder="We all have a COVID-19 story. Share your COVID-19 story now…"
            multiline
            rowsMax={10}
            value={myStory}
            onChange={handleChange}
            className={classNames("textarea", styles.textarea)}
            variant="filled"
          />
          <Button
            onClick={() => props.history.push(paths.onboard)}
            className={classNames("skipBtn", styles.skipBtn)}
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
        {/* <div className={classNames("userNum", styles.userNum)}>
          {userNum} of users shared their stories
        </div> */}
      </div>
      <div className={classNames("background", styles.background)} />
      <SimpleMap draggable={draggableMap} />
    </>
  );
}
