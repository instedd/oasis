import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import api from "utils";
import { useSelector, useDispatch } from "react-redux";
import Button from "@material-ui/core/Button";
import styles from "./styles.module.css";
import classNames from "classnames";
import { fetchStory } from "actions/story";
import paths from "routes/paths";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: "6px 16px",
    width: "60vh",
  },
  secondaryTail: {
    backgroundColor: theme.palette.secondary.main,
  },
  // root: {
  //   "& > *": {
  //     margin: theme.spacing(1),
  //   },
  // },
  content: {
    width: "90vh",
  },
}));

export default function StoryHistory(props) {
  const { story } = useSelector((state) => state.story);
  const [stories, setStories] = useState([]);
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!story) {
      dispatch(fetchStory());
    } else {
      api(`stories/${story.id}/my_stories`, {
        method: "GET",
      }).then((data) => {
        setStories(data);
      });
    }
  }, [dispatch, story]);
  console.log(stories);
  const handleClick = () => {
    props.history.push(paths.myStory);
  };

  return (
    <>
      <h1 className="title">MY COVID-19 STORY</h1>
      <Button variant="contained" color="secondary" onClick={handleClick}>
        Add New Story
      </Button>
      <div className={classNames("root", styles.root)}>
        <Timeline>
          {stories.reverse().map((my_story, i) => (
            <TimelineItem key={i}>
              <TimelineOppositeContent>
                <Typography variant="h6" component="h1">
                  {my_story.createdAt}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot></TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <div className={classes.content}>
                <TimelineContent>
                  <Typography>{my_story.text}</Typography>
                </TimelineContent>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
        <Fab
          style={{ background: "#9206FF" }}
          aria-label="add"
          onClick={() => props.history.push(paths.dashboard)}
          size="medium"
          className="fab back-btn"
        >
          <ArrowLeftIcon />
        </Fab>
      </div>
    </>
  );
}
