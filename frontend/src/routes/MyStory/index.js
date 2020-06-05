import React from "react";
import { TextField, Fab } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import classNames from "classnames";
import styles from "./styles.module.css";
import Wrapper from "components/Wrapper";
import { withStyles } from "@material-ui/core/styles";

export default function MyStory(props) {
  const [story, setStory] = React.useState("");

  const handleChange = (event) => {
    setStory(event.target.value);
  };

  const StyledTextField = withStyles({
    root: {
      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3f51b5 !important",
      },
    },
  })(TextField);

  return (
    <Wrapper>
      <h1 className="title">MY COVID-19 STORY</h1>
      <h3 className="subtitle">Your COVID-19 story in your own words</h3>
      <StyledTextField
        id="outlined-multiline-static"
        placeholder="Tell a little about yourself, how you think you got sick and what the experience has been like"
        multiline
        rowsMax={10}
        value={story}
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
    </Wrapper>
  );
}
