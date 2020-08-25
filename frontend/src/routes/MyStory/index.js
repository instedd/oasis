import React from "react";
import { Fab, Button } from "@material-ui/core";
import Wrapper from "components/Wrapper";
import paths from "routes/paths";

export default function MyStory(props) {
  function handleSubmit() {
    // TODO
  }

  return (
    <Wrapper>
      <h1 className="title">
        We will put your story on the map, would you like to provide us more
        information about yourself?
      </h1>
      <Fab
        style={{ background: "#0559FD", color: "white" }}
        aria-label="add"
        size="medium"
        onClick={handleSubmit}
        variant="extended"
      >
        LOGIN AND UPDATE MYSTORY
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
      <Button onClick={() => props.history.push(paths.onboard)}>
        continue as guest
      </Button>
    </Wrapper>
  );
}
