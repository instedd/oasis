import React, { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./styles.module.css";
import { getStoryResources } from "actions/resources";
import {
  Tabs,
  Tab,
  Link,
  FormControl,
  InputBase,
  IconButton,
  Button,
  Collapse,
} from "@material-ui/core";
import PropTypes from "prop-types";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import LinkIcon from "@material-ui/icons/Link";
import SearchIcon from "@material-ui/icons/Search";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import api from "utils";

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 2,
    position: "fixed",
    background: "rgba(0,0,0,0.8)",
    width: 400,
    maxWidth: "100%;",
    paddingTop: 70,
  },
  searchBar: {
    display: "flex",
    padding: "2px 4px",
    alignItems: "center",
    border: "1px solid white",
    borderRadius: 40,
    flexDirection: "row",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: "white",
  },
  iconButton: {
    padding: 10,
    color: "white",
  },
  tab: {
    fontSize: 12,
    height: 50,
    minWidth: 120,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  tabPanel: {
    height: "calc(100vh - 70px - 72px - 44px)",
  },
}));

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function Widget(props) {
  const userStory = props.userStory;
  const [data, setData] = useState({
    confirmed: "",
    deaths: "",
    recovered: "",
  });
  const [expanded, setExpanded] = useState(true);
  const [storyIndex, setStoryIndex] = useState(-1);
  const storyList = props.storyList;
  const [nums, setNums] = useState({
    userNum: null,
    storyNum: null,
  });

  useEffect(() => {
    api(`stories/all`, {
      method: "GET",
    }).then((storiesData) => {
      setNums({
        userNum: storiesData.length,
        storyNum: storiesData.filter((story) => story.latestMyStory).length,
      });
    });
  }, []);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  function TabPanel(props) {
    const { children, value, index } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tabpanel-${index}`}
      >
        {value === index && <div className={classes.tabPanel}>{children}</div>}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  useEffect(() => {
    fetch("https://covid19api.herokuapp.com/latest")
      .then((res) => res.json())
      .then((result) => setData(result));
  }, []);

  const classes = useStyles();
  const [tabIndex, setTabIndex] = React.useState(2);
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const stats = (
    <div className={classNames(styles.stats)}>
      <div>
        <h3> Global Total </h3>
        <div>Confirmed: {data.confirmed}</div>
        <div> Deaths: {data.deaths}</div>
        <div> Recovered: {data.recovered}</div>
      </div>
      <br></br>
      <div id="pd">
        <h3> Confirmed Cases </h3>
        <div> Hover over/Click a state or country!</div>
      </div>

      <br></br>
      <div>
        <h3> Usage Statistics </h3>
        <p id="users_num">There are {nums.userNum} users on OASIS</p>
        <p id="stories_num">{nums.storyNum} of them shared their stories</p>
      </div>
    </div>
  );

  const resources = (
    <div className={classNames(styles.resources)}>
      {getStoryResources(userStory).map((resource, i) => (
        <div className={classNames(styles.link)}>
          <LinkIcon />
          <Link
            href={resource.site}
            {...(resource.color ? { style: { color: resource.color } } : {})}
            target="_blank"
            key={i}
          >
            {resource.text}
          </Link>
        </div>
      ))}
    </div>
  );

  const stories = (
    <div className={classNames(styles.stories)}>
      <div className={styles.searchBarWrapper}>
        <FormControl className={classes.searchBar}>
          <InputBase
            className={classes.input}
            placeholder="Search Keywords"
            inputProps={{ "aria-label": "search google maps" }}
          />
          <IconButton
            type="submit"
            className={classes.iconButton}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        </FormControl>
      </div>
      <div className={classNames("storyList", styles.storyList)}>
        {storyIndex < 0 ? (
          storyList.map((story, index) => (
            <div key={index} className={classNames(styles.storyItem)}>
              <p>{story.text}</p>
              <div className={classNames(styles.storyBtn)}>
                <span className={classNames(styles.createAt)}>
                  {" "}
                  create at: {story.updatedAt}
                </span>
                <Button size="small" onClick={() => setStoryIndex(index)}>
                  More
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className={classNames(styles.expandedStory)}>
            <div key={storyIndex} className={classNames(styles.content)}>
              <p>{storyList[storyIndex].text}</p>
              <div className={classNames(styles.createAt)}>
                {" "}
                create at: {storyList[storyIndex].updatedAt}
              </div>
            </div>
            <Button size="small" onClick={() => setStoryIndex(-1)}>
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { label: "resources", content: resources, icon: <LinkIcon /> },
    { label: "statistics", content: stats, icon: <EqualizerIcon /> },
    { label: "stories", content: stories, icon: <LibraryBooksIcon /> },
  ];

  return (
    <div className={classes.root}>
      <Tabs
        variant="fullWidth"
        value={tabIndex}
        onChange={handleChange}
        aria-label="tabs"
        className={classes.tabs}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            className={classes.tab}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {tabs.map((tab, index) => (
          <TabPanel
            key={index}
            value={tabIndex}
            index={index}
            lassName={classes.tabPanel}
          >
            {tab.content}
          </TabPanel>
        ))}
      </Collapse>
      <IconButton
        className={clsx(classes.expand, classes.iconButton, {
          [classes.expandOpen]: expanded,
        })}
        onClick={handleExpandClick}
        aria-label="expand"
      >
        <ExpandMoreIcon />
      </IconButton>
    </div>
  );
}
