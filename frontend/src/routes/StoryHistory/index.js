import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
import { fetchMyStory } from "actions/story";
import paths from "routes/paths";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: "6px 16px",
  },
  secondaryTail: {
    backgroundColor: theme.palette.secondary.main,
  },
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

export default function StoryHistory(props) {
  const [myStory, setMyStory] = React.useState("");
  const { story } = useSelector((state) => state.story);
  const [stories, setStories] = useState([]);
  const classes = useStyles();
  const dispatch = useDispatch();
  // useEffect(() => {
  //     api(`stories/${story.id}/my_stories`, {
  //       method: "GET",
  //     }).then((data) => {
  //       setStories(data)
  //     });
  //   }, []);
  //console.log(story);
  console.log(stories);
  const handleClick = () => {
    props.history.push(paths.myStory);
  };

  return (
    <>
      <div className={classNames("root", styles.root)}>
        <h1 className="title">MY COVID-19 STORY</h1>
        <Timeline align="alternate">
          {stories.map((my_story, i) => (
            <TimelineItem>
              <TimelineOppositeContent>
                <Typography variant="body2" color="textSecondary">
                  {my_story.id}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot></TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={3} className={classes.paper}>
                  <Typography variant="h6" component="h1">
                    {my_story.text}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        <Button variant="contained" color="secondary" onClick={handleClick}>
          Add New Story
        </Button>
      </div>
    </>
  );
}
