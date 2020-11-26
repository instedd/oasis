import React, { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./styles.module.css";
import { getStoryResources } from "actions/resources";
import {
  Tabs,
  Tab,
  Box,
  Link,
  Card,
  CardContent,
  FormControl,
  InputBase,
  IconButton,
  Collapse,
} from "@material-ui/core";
import PropTypes from "prop-types";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import LinkIcon from "@material-ui/icons/Link";
import SearchIcon from "@material-ui/icons/Search";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 2,
    position: "fixed",
    height: "100%",
    display: "flex",
    background: "rgba(0,0,0,0.8)",
    width: "max-content",
    maxWidth: "100%;",
    paddingTop: 80,
  },
  tabPanel: {
    width: 340,
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
  const storyList = props.storyList;
  const [expanded, setExpanded] = React.useState(false);

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
        {value === index && (
          <Collapse
            in={expanded}
            className={classes.tabPanel}
            timeout="auto"
            unmountOnExit
          >
            <div>{children}</div>
          </Collapse>
        )}
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
        <h2> Global Total </h2>
        <h3>
          Confirmed: {data.confirmed}
          Deaths: {data.deaths}
          Recovered: {data.recovered}
        </h3>
      </div>
    </div>
  );

  const resources = (
    <div className={classNames(styles.resources)}>
      {getStoryResources(userStory).map((resource, i) => (
        <Link
          href={resource.site}
          {...(resource.color ? { style: { color: resource.color } } : {})}
          target="_blank"
          key={i}
        >
          {resource.text}
        </Link>
      ))}
    </div>
  );

  const stories = (
    <div className={classNames(styles.storyList)}>
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
      {storyList.map((story, index) => (
        <Card key={index}>
          <CardContent>
            {story.createAt}
            {story.text}
          </CardContent>
        </Card>
      ))}
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
        orientation="vertical"
        variant="scrollable"
        value={tabIndex}
        onChange={handleChange}
        aria-label="Vertical tabs"
        className={classes.tabs}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            {...a11yProps(index)}
          />
        ))}
        <IconButton
          className={clsx(classes.expand, classes.iconButton, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ChevronRightIcon />
        </IconButton>
      </Tabs>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={tabIndex} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </div>
  );
}
