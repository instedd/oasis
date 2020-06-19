import {
  Checkbox,
  Fab,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { DatePicker } from "@material-ui/pickers";
import { submitStory, fetchStory } from "actions/story";
import classNames from "classnames";
import Pop from "components/PopUp";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import paths from "routes/paths";
import Text from "text.json";
import { sicknessStatus } from "../types";
import styles from "./styles.module.css";
import { ERROR } from "actions/types";
import { fields, initialFieldsState } from "./fields";

const contactText = Text["Close Contacts"].texts;
const contactListIndex = Text["Close Contacts"].listIndex;
const contactLinkIndex = Text["Close Contacts"].linkIndex;
const travelText = Text["Recent Travel"].texts;
const travelListIndex = Text["Recent Travel"].listIndex;
const travelLinkIndex = Text["Recent Travel"].linkIndex;
const professions = Text["Profession"];
const medicalConditions = Text["Medical Conditions"];

const ethnicGroups = [
  {
    value: "American Indian or Alaska Native",
    label: "American Indian or Alaska Native",
  },
  { value: "Asian", label: "Asian" },
  { value: "Black or African American", label: "Black or African American" },
  { value: "Hispanic or Latino", label: "Hispanic or Latino" },
  {
    value: "Native Hawaiian or Other Pacific Islander",
    label: "Native Hawaiian or Other Pacific Islander",
  },
  { value: "White", label: "White" },
];

function CriticalQuestions(props) {
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState(initialFieldsState());

  const [travelDates, setTravelDates] = useState({ 0: null });
  const [travelDatesIndex, setTravelDatesIndex] = useState(0);

  const [contactCount, setContactCount] = useState(0);
  const [locationCount, setLocationCount] = useState(0);

  let nextPage;
  const { story, status } = useSelector((state) => state.story);

  useEffect(() => {
    if (!story) dispatch(fetchStory());
    else setFormValues({ ...formValues, ...story });
  }, [dispatch, story]);

  const handleFormChange = (field) => (event) => {
    const intFields = [fields.AGE];
    const nonValueFields = [fields.SICKNESS_START, fields.SICKNESS_END];
    const key = field.key;

    if (intFields.includes(field)) {
      setFormValues({ ...formValues, [key]: parseInt(event.target.value) });
    } else if (nonValueFields.includes(field)) {
      setFormValues({ ...formValues, [key]: event });
    } else {
      setFormValues({ ...formValues, [key]: event.target.value });
    }
  };

  function handleTravelDateChange(date) {
    setTravelDates({ ...travelDates, [travelDatesIndex]: date });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const { ...story } = formValues;
    if (story.sick === sicknessStatus.NOT_SICK) nextPage = paths.dashboard;
    else nextPage = paths.symptoms;
    const dto = { story, nextPage };
    dispatch(submitStory(dto));
  };

  const [countries, setCountries] = useState([]);

  const sicknessEndPicker = (
    <DatePicker
      autoOk
      label={fields.SICKNESS_END.label}
      clearable
      disableFuture
      value={formValues[fields.SICKNESS_END.key]}
      onChange={handleFormChange(fields.SICKNESS_END)}
    />
  );

  const sicknessStartPicker = (
    <DatePicker
      autoOk
      label={fields.SICKNESS_START.label}
      clearable
      disableFuture
      value={formValues[fields.SICKNESS_START.key]}
      onChange={handleFormChange(fields.SICKNESS_START)}
    />
  );

  const shouldDisplaySicknessPicker = (picker) => {
    const validStatus = new Map();
    validStatus.set("start", [sicknessStatus.RECOVERED, sicknessStatus.SICK]);
    validStatus.set("end", [sicknessStatus.RECOVERED]);

    return story && validStatus.get(picker).includes(story.sick);
  };

  useEffect(() => {
    fetch("https://restcountries.eu/rest/v2/all?fields=name")
      .then((res) => res.json())
      .then(
        (result) => {
          setCountries(result);
        },
        () => {}
      );
  }, []);

  const contacts = [];
  for (let i = 0; i < contactCount; i++) {
    contacts.push(
      <div key={i}>
        <div className={classNames("grid-3", styles["grid-3"])}>
          <TextField label="Email" />
        </div>
        <div className={classNames("grid-3", styles["grid-3"])}>
          <TextField label="Phone Number" />
        </div>
      </div>
    );
  }

  const locations = [];
  for (let i = 0; i < locationCount; i++) {
    locations.push(
      <div key={i}>
        <div className={classNames("grid-3", styles["grid-3"])}>
          <TextField label="Current location" />
        </div>
        <div className={classNames("grid-3", styles["grid-3"])}>
          <DatePicker
            label="Date"
            key={i}
            id={`hi-${i}`}
            clearable
            disableFuture
            value={travelDates[i]}
            onOpen={() => setTravelDatesIndex(i)}
            onChange={(date) => handleTravelDateChange(date)}
          />
        </div>
      </div>
    );
  }

  const pageBottomRef = React.useRef(null);

  const scrollToBottom = () => {
    pageBottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(scrollToBottom, [locations]);
  React.useEffect(scrollToBottom, [contacts]);

  return (
    <>
      {status && status.type == ERROR && (
        <p className={classNames(styles.status, styles.error)}>
          {status.detail}
        </p>
      )}
      <h1 className="title" style={{ margin: 0 }}>
        MY COVID STORY
      </h1>
      <div className={classNames("root", styles.root)}>
        <div className={classNames("grid-3", styles["grid-3"])}>
          {shouldDisplaySicknessPicker("start") && sicknessStartPicker}
          {shouldDisplaySicknessPicker("end") && sicknessEndPicker}
        </div>
        <div className={classNames("grid-1", styles["grid-1"])}>
          <TextField
            id={fields.AGE.key}
            label={fields.AGE.label}
            type="number"
            value={formValues[fields.AGE.key]}
            onChange={handleFormChange(fields.AGE)}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <TextField
            id={fields.SEX.key}
            select
            label={fields.SEX.label}
            value={formValues[fields.SEX.key]}
            onChange={handleFormChange(fields.SEX)}
          >
            <MenuItem value={"male"}>Male</MenuItem>
            <MenuItem value={"female"}>Female</MenuItem>
            <MenuItem value={"other"}>Other</MenuItem>
            <MenuItem value={null}>I don't want to answer</MenuItem>
          </TextField>

          <TextField
            select
            label={fields.ETHNICITY.label}
            value={formValues[fields.ETHNICITY.key]}
            onChange={handleFormChange(fields.ETHNICITY)}
          >
            {ethnicGroups.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div
          className={classNames("location-wrapper", styles["location-wrapper"])}
        >
          <div className={classNames("grid-1", styles["grid-1"])}>
            <FormControl>
              <TextField
                select
                label={fields.CURRENT_LOCATION.label}
                value={formValues[fields.CURRENT_LOCATION.key]}
                onChange={handleFormChange(fields.CURRENT_LOCATION)}
              >
                {countries.map((option) => (
                  <MenuItem key={option.name} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText>Country</FormHelperText>
            </FormControl>
            <FormControl>
              <TextField
                label={fields.POSTAL_CODE.label}
                value={formValues[fields.POSTAL_CODE.key]}
                onChange={handleFormChange(fields.POSTAL_CODE)}
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </FormControl>
            <TextField
              select
              label={fields.COUNTRY_OF_ORIGIN.label}
              value={formValues[fields.COUNTRY_OF_ORIGIN.key]}
              onChange={handleFormChange(fields.COUNTRY_OF_ORIGIN)}
            >
              {countries.map((option) => (
                <MenuItem key={option.name} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>
        <div
          className={classNames("grid-2", styles["grid-2"])}
          style={{ paddingTop: 0 }}
        >
          <TextField
            select
            label={fields.PROFESSION.label}
            value={formValues[fields.PROFESSION.key]}
            onChange={handleFormChange(fields.PROFESSION)}
          >
            {professions.map((option) => (
              <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <FormControl>
            <InputLabel id="medical-conditions">
              {fields.MEDICAL_CONDITIONS.label}
            </InputLabel>
            <Select
              labelId="medical-conditions"
              id="medical-conditions-checkbox"
              multiple
              value={formValues[fields.MEDICAL_CONDITIONS.key]}
              input={<Input />}
              onChange={handleFormChange(fields.MEDICAL_CONDITIONS)}
              renderValue={(selected) => selected.join(", ")}
            >
              {medicalConditions.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox
                    checked={
                      formValues[fields.MEDICAL_CONDITIONS.key].indexOf(name) >
                      -1
                    }
                  />
                  <ListItemText
                    primary={name}
                    className={classNames(
                      "checkbox-label",
                      styles["checkbox-label"]
                    )}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className={classNames("form-row contacts", styles.contacts)}>
          <Fab
            style={{ background: "#EA2027" }}
            aria-label="add"
            size="medium"
            className="fab"
            onClick={() => setContactCount(contactCount + 1)}
          >
            <AddIcon />
          </Fab>
          <p>Close Contacts</p>
          <Pop
            label={<ErrorOutlineIcon />}
            title={<span></span>}
            texts={contactText}
            linkIndex={contactLinkIndex}
            listIndex={contactListIndex}
          />
        </div>
        {contacts}
        <div className={classNames("form-row travels", styles.travels)}>
          <Fab
            style={{ background: "#EA2027" }}
            aria-label="add"
            size="medium"
            className="fab"
            onClick={() => setLocationCount(locationCount + 1)}
          >
            <AddIcon />
          </Fab>
          <p>Recent Travels</p>
          <Pop
            label={<ErrorOutlineIcon />}
            title={<span></span>}
            texts={travelText}
            linkIndex={travelLinkIndex}
            listIndex={travelListIndex}
          />
        </div>
        {locations}
        <div style={{ height: "30px" }} ref={pageBottomRef}></div>
      </div>
      <Fab
        style={{ background: "#EA2027" }}
        aria-label="Go to next page"
        size="medium"
        className="fab next-btn"
        onClick={handleSubmit}
      >
        <ArrowRightIcon />
      </Fab>
      <Fab
        style={{ background: "#9206FF" }}
        aria-label="Go to previous page"
        size="medium"
        className="fab back-btn"
        onClick={() => {
          props.history.goBack();
        }}
      >
        <ArrowLeftIcon />
      </Fab>
    </>
  );
}

export default CriticalQuestions;
