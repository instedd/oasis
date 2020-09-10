import React from "react";
import { Fab, Button, Checkbox } from "@material-ui/core";
import paths from "routes/paths";
import styles from "./styles.module.css";
import Pop from "components/PopUp";
import Text from "../../text.json";

export default function MyStory(props) {
  const texts = Text["Terms and Conditions"].texts;
  const listIndex = Text["Terms and Conditions"].listIndex;
  const linkIndex = Text["Terms and Conditions"].linkIndex;
  const from = props.history.location.state.from;

  const prompt =
    from === "shareBtn" ? (
      <h1 className="title">
        We will put your story on the map, would you like to provide us more
        information about yourself?
      </h1>
    ) : null;

  const termsAndConditions = (
    <div className={styles.termsWrapper}>
      <Checkbox
        id="checkbox"
        style={{ color: "white", padding: "0px 2px" }}
        onChange={(e) => {
          if (e.target.checked) {
            var warning = document.getElementById("warning");
            warning.style.display = "none";
          }
        }}
      />
      <Pop
        label={<span className={styles.terms}> Terms and Conditions</span>}
        title={<h2 style={{ textAlign: "center" }}>Terms and Conditions</h2>}
        texts={texts}
        linkIndex={linkIndex}
        listIndex={listIndex}
      />
      <div id="warning" className={styles.warning}>
        Please read the Terms & Conditions
      </div>
    </div>
  );

  function handleClick(path, onboard) {
    if (document.getElementById("checkbox").checked) {
      props.history.push(path, { onboard: onboard });
    } else {
      var warning = document.getElementById("warning");
      warning.style.display = "block";
    }
  }
  return (
    <>
      <div className={styles.myStory}>
        {prompt}
        {termsAndConditions}
        <div className={styles.btnGroup}>
          <Fab
            style={{ background: "#0559FD", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={() => handleClick(paths.signIn)}
            variant="extended"
          >
            {from === "shareBtn" ? "SIGN IN AND UPDATE MYSTORY" : "SIGN IN"}
          </Fab>
          <Fab
            style={{ background: "#9206FF", color: "white" }}
            aria-label="add"
            size="medium"
            onClick={() => handleClick(paths.signUp)}
            variant="extended"
          >
            SIGN UP
          </Fab>
          <Button
            className={styles.skipBtn}
            onClick={() => handleClick(paths.onboard, false)}
          >
            continue as guest
          </Button>
        </div>
      </div>
    </>
  );
}
