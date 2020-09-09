import React from "react";
import { Fab, Button } from "@material-ui/core";
import paths from "routes/paths";
import styles from "./styles.module.css";

export default function MyStory(props) {
  const from = props.history.location.state.from;
  const prompt =
    from === "shareBtn" ? (
      <h1 className="title">
        We will put your story on the map, would you like to provide us more
        information about yourself?
      </h1>
    ) : null;
  console.log(props.history.location.state.from);
  return (
    <>
      <div className={styles.myStory}>
        {prompt}
        <div className={styles.btnGroup}>
          <Fab
            style={{ background: "#0559FD", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={() => props.history.push(paths.signIn)}
            variant="extended"
          >
            {from === "shareBtn" ? "SIGN IN AND UPDATE MYSTORY" : "SIGN IN"}
          </Fab>
          <Fab
            style={{ background: "#9206FF", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={() => props.history.push(paths.signUp)}
            variant="extended"
          >
            SIGN UP
          </Fab>
        </div>
        <Button
          className={styles.skipBtn}
          onClick={() => props.history.push(paths.onboard, { onboard: false })}
        >
          continue as guest
        </Button>
      </div>
    </>
  );
}
