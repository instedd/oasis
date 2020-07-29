import React from "react";
import classNames from "classnames";
import { Checkbox } from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import { makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

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
  const [dialOpen, setDialOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDialOpen = () => {
    setDialOpen(true);
  };

  const handleDialClose = () => {
    setDialOpen(false);
  };

  const texts = Text["Terms and Conditions"].texts;
  const listIndex = Text["Terms and Conditions"].listIndex;
  const linkIndex = Text["Terms and Conditions"].linkIndex;
  //if(document.getElementById('speeddial')) console.log(document.getElementById('speeddial'));
  console.log(open);
  return (
    <>
      <h1 className={styles.title}>FIGHT COVID-19 PUT YOUR STORY ON THE MAP</h1>
      <div>
        <Dialog
          open={dialOpen}
          onClose={handleDialClose}
          fullWidth={true}
          maxWidth={"md"}
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please read the Terms and Conditions.
            </DialogContentText>
          </DialogContent>
        </Dialog>
        <SpeedDial
          id="speeddial"
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
              <div style={{ alignItems: "center" }}>
                <Checkbox
                  id="checkbox"
                  style={{ color: "white", padding: "0 5px 0 0" }}
                />
                <Pop
                  label={
                    <span
                      style={{ textDecoration: "underline", color: "white" }}
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
                  handleDialOpen();
                  history.push("", action.state || {});
                }
              }}
            />
          ))}
        </SpeedDial>
      </div>
    </>
  );
}

export default App;
