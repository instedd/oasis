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
import RemoveIcon from "@material-ui/icons/Remove";
import api from "utils";
import { sicknessStatus, testStatus } from "routes/types";

const statusMapping = {
  [testStatus.POSITIVE]: { name: "Tested Positive", color: "red" },
  [testStatus.NEGATIVE]: { name: "Tested Negative", color: "purple" },
  [testStatus.NOT_TESTED]: { name: "Not Tested", color: "blue" },
  [sicknessStatus.SICK]: { name: "Sick", color: "orange" },
  [sicknessStatus.RECOVERED]: { name: "Recovered", color: "green" },
  [sicknessStatus.NOT_SICK]: { name: "Not Sick", color: "gray" },
};

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
  const [singleStory, setSingleStory] = useState({
    status: false,
    list: null,
    index: -1,
  });
  const storyList = props.storyList;
  const [nums, setNums] = useState({
    userNum: null,
    storyNum: null,
  });
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState("");

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
  };
  function searchStories(keyword) {
    if (!keyword) {
      setSearchResults(
        <h4 style={{ color: "var(--primary)" }}>
          Please enter keywords for searching
        </h4>
      );
      return false;
    }

    api(`stories/search`, {
      method: "POST",
      body: { text: keyword },
    }).then((results) => {
      if (results.length === 0)
        setSearchResults(
          <h4 style={{ color: "var(--primary)" }}>No search result</h4>
        );
      else {
        setSearchResults(
          <div>
            <div className={classNames(styles.searchTitle)}>
              <h4>Search Results</h4>
              <IconButton
                onClick={() => {
                  setSearchResults("");
                }}
              >
                <RemoveIcon />
              </IconButton>
            </div>
            {results.map((story, index) => (
              <div key={index} className={classNames(styles.storyItem)}>
                <p>
                  {story.text.length > 200
                    ? story.text.substring(0, 200) + "..."
                    : story.text}
                </p>
                <div className={classNames(styles.storyBtn)}>
                  <span className={classNames(styles.createAt)}>
                    create at: {story.updatedAt}
                  </span>
                  <Button
                    size="small"
                    onClick={() =>
                      setSingleStory({
                        status: true,
                        list: results,
                        index: index,
                      })
                    }
                  >
                    More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      }
    });
  }

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

  const nearestStories = (
    <div>
      <h4>Nearest Stories</h4>
      {storyList.map((story, index) => (
        <div key={index} className={classNames(styles.storyItem)}>
          <p>
            {story.text.length > 200
              ? story.text.substring(0, 200) + "..."
              : story.text}
          </p>
          <div className={classNames(styles.storyBtn)}>
            <span className={classNames(styles.createAt)}>
              create at: {story.updatedAt}
            </span>
            <Button
              size="small"
              onClick={() =>
                setSingleStory({ status: true, list: storyList, index: index })
              }
            >
              More
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  let expandedStory;
  if (singleStory.list !== null && singleStory.index !== -1) {
    expandedStory = (
      <div className={classNames(styles.expandedStory)}>
        <div key={singleStory.index} className={classNames(styles.content)}>
          <p>{singleStory.list[singleStory.index].text}</p>
          <div className={classNames(styles.createAt)}>
            create at: {singleStory.list[singleStory.index].updatedAt}
          </div>
        </div>
        <Button
          size="small"
          onClick={() =>
            setSingleStory({ status: false, list: null, index: -1 })
          }
        >
          Back
        </Button>
      </div>
    );
  }

  let displayedStories;
  if (singleStory.status) {
    displayedStories = (
      <div className={classNames("storyList", styles.storyList)}>
        {expandedStory}
      </div>
    );
  } else {
    displayedStories = (
      <div className={classNames("storyList", styles.storyList)}>
        {searchResults}
        {nearestStories}
      </div>
    );
  }

  const stories = (
    <div className={classNames(styles.stories)}>
      <div className={styles.searchBarWrapper}>
        <FormControl className={classes.searchBar}>
          <InputBase
            className={classes.input}
            value={keyword}
            error
            onChange={handleKeywordChange}
            placeholder="Search Keywords"
            inputProps={{ "aria-label": "searchbar" }}
            autoFocus
          />
          <IconButton
            type="submit"
            className={classes.iconButton}
            aria-label="search"
            onClick={() => searchStories(keyword)}
          >
            <SearchIcon />
          </IconButton>
        </FormControl>
      </div>
      {displayedStories}
    </div>
  );

  const tabs = [
    { label: "resources", content: resources, icon: <LinkIcon /> },
    { label: "statistics", content: stats, icon: <EqualizerIcon /> },
    { label: "stories", content: stories, icon: <LibraryBooksIcon /> },
  ];

  const userStatus = () => (
    <div
      className={classNames(styles.statusList)}
      style={{ textAlign: "left" }}
    >
      <div className={classNames("row", styles.statusItem)}>
        <span
          className={styles.dot}
          style={{ background: statusMapping[userStory.sick].color }}
        />
        {statusMapping[userStory.sick].name.toUpperCase()}
      </div>
      <div className={classNames("row", styles.statusItem)}>
        <span
          className={styles.dot}
          style={{ background: statusMapping[userStory.tested].color }}
        />
        {statusMapping[userStory.tested].name.toUpperCase()}
      </div>
    </div>
  );

  return (
    <div className={classes.root}>
      <>{userStatus()}</>
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
