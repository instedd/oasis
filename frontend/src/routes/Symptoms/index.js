import {
  Checkbox,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import CheckCircle from "@material-ui/icons/CheckCircle";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import { fetchSymptoms, submitSymptoms } from "actions/symptoms";
import { SUCCESS } from "actions/types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import paths from "routes/paths";
import { sicknessStatus } from "routes/types";
import styles from "./styles.module.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90vw",
    overflow: "auto",
    margin: "auto",
  },
  group: {
    "& > *": {
      margin: 0,
      width: "30vw",
    },
    "& .MuiTypography-body1": {
      fontSize: 14,
      fontFamily: "abel",
    },
  },
  input: {
    color: "white",
    "&:before": {
      borderBottom: "1px solid white",
    },
  },
  label: {
    color: "white",
    width: "max-content",
    fontSize: 15,
  },
  others: {
    "& > *": {
      marginTop: theme.spacing(-1),
      marginBottom: theme.spacing(2),
      width: "80%",
    },
    width: "100vw",
  },
}));

export default function Symptoms(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchSymptoms());
  }, [dispatch]);

  const symptoms = useSelector((state) => state.symptoms);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const navigate = (path) => () =>
    dispatch(submitSymptoms(selectedSymptoms, path));

  const toggleSymptom = (id) => {
    setSelectedSymptoms(
      selectedSymptoms.includes(id)
        ? selectedSymptoms.filter((symptom) => symptom !== id)
        : selectedSymptoms.concat([id])
    );
  };

  const classes = useStyles();
  const isSick = useSelector((state) => state.story.sick);
  const subtitle =
    isSick === sicknessStatus.RECOVERED
      ? "When you were sick, which of the following symptoms did you have?"
      : "Are you having now, or did you recently have:";
  return (
    <div className={styles.symptoms}>
      <h1 className="title"> MY COVID STORY</h1>
      {symptoms.status.type !== SUCCESS && symptoms.status.detail}
      <p className={styles.subtitle}>{subtitle}</p>
      <FormControl className={classes.root} component="fieldset">
        <FormGroup className={classes.group} aria-label="position" row>
          {symptoms.all.map(({ id, name }) => (
            <FormControlLabel
              value={id}
              control={
                <Checkbox
                  style={{ color: "white" }}
                  icon={<RadioButtonUncheckedIcon style={{ fontSize: 30 }} />}
                  checkedIcon={<CheckCircle style={{ fontSize: 30 }} />}
                />
              }
              label={name}
              key={`symptom-${id}`}
              labelPlacement="top"
              onClick={() => toggleSymptom(id)}
            />
          ))}
        </FormGroup>
      </FormControl>

      <div className={classes.others}>
        <TextField
          id="standard-number"
          label="Other Symptoms"
          InputProps={{ className: classes.input }}
          InputLabelProps={{
            className: classes.label,
          }}
        />
      </div>
      <Fab
        style={{ background: "#EA2027" }}
        aria-label="Go to next page"
        onClick={navigate(paths.healthMeasurements)}
        size="medium"
        className="fab next-btn"
      >
        <ArrowRightIcon />
      </Fab>
      <Fab
        style={{ background: "#9206FF" }}
        aria-label="Go to previous page"
        onClick={navigate()}
        size="medium"
        className="fab back-btn"
      >
        <ArrowLeftIcon />
      </Fab>
    </div>
  );
}
