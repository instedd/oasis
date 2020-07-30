import React from "react";
import classNames from "classnames";
import { Checkbox } from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import { makeStyles } from "@material-ui/core/styles";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";

import Text from "../../text.json";
import Pop from "components/PopUp";
import paths from "routes/paths";

import styles from "./styles.module.css";
import history from "../../history";

const useStyles = makeStyles((theme) => ({
  speedDial: {
    "& .MuiFab-label": {
      width: "max-content",
      padding: 2,
    },
  },
  button: {
    "&:hover": {
      background: "#EA2027",
      color: "white",
    },
    background: "#EA2027",
    color: "white",
    size: "large",
  },
  terms: {
    background: "none",
    color: "white",
    width: "max-content",
    borderRadius: 0,
    boxShadow: "none",
    "&:hover": {
      background: "none",
    },
  },
}));

const useStylesTooltip = makeStyles((theme) => ({
  tooltip: {
    display: "none",
  },
}));

const actions = [
  {
    name: " SIGN IN / SIGN UP ",
    href: paths.signIn,
    classes: classNames(styles.signin, "MuiFab-extended"),
  },
  {
    name: " CONTINUE AS GUEST ",
    href: paths.onboard,
    state: { onboard: false },
    classes: "MuiFab-extended",
  },
];

function App(props) {
  const classes = useStyles();
  const classesTooltip = useStylesTooltip();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const texts = Text["Terms and Conditions"].texts;
  const listIndex = Text["Terms and Conditions"].listIndex;
  const linkIndex = Text["Terms and Conditions"].linkIndex;
  return (
    <>
      <h1 className={styles.title}>
        FIGHT COVID-19 <br /> PUT YOUR STORY <br /> ON THE MAP
      </h1>
      <div>
        <SpeedDial
          ariaLabel="Take action"
          className={classes.speedDial}
          icon={<SpeedDialIcon />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          FabProps={{ className: classes.button }}
        >
          <SpeedDialAction
            key="terms"
            className={classes.terms}
            tooltipTitle="Terms and Conditions"
            icon={
              <div style={{ alignItems: "center", padding: "0px 6px" }}>
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
                  label={
                    <span
                      style={{
                        textDecoration: "underline",
                        color: "white",
                        fontSize: 16,
                      }}
                    >
                      Terms and Conditions
                    </span>
                  }
                  title={
                    <h2 style={{ textAlign: "center" }}>
                      Terms and Conditions
                    </h2>
                  }
                  texts={texts}
                  linkIndex={linkIndex}
                  listIndex={listIndex}
                />
              </div>
            }
            TooltipClasses={classesTooltip}
          />
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.name}
              tooltipTitle={action.name}
              className={action.classes}
              TooltipClasses={classesTooltip}
              onClick={() => {
                if (document.getElementById("checkbox").checked) {
                  history.push(action.href, action.state || {});
                } else {
                  history.push("", action.state || {});
                  var warning = document.getElementById("warning");
                  warning.style.display = "inline";
                }
              }}
            />
          ))}
          <SpeedDialAction
            key="read"
            className={classes.terms}
            tooltipTitle="Read"
            TooltipClasses={classesTooltip}
            icon={
              <div
                id="warning"
                style={{ alignItems: "center", display: "none" }}
              >
                <ErrorOutlineIcon
                  style={{ fontSize: "medium", color: "red" }}
                />
                <span style={{ color: "red", fontSize: 11 }}>
                  <strong>Please read the Terms & Conditions</strong>
                </span>
              </div>
            }
          />
        </SpeedDial>
      </div>
    </>
  );
}

export default App;
