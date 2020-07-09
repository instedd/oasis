import {
  Checkbox,
  Fab,
  FormControl,
  FormHelperText,
  ListItemText,
  MenuItem,
  TextField,
  List,
  ListItem,
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
import Select from "../../components/Select";
import MyStory from "../MyStory/index";

const contactText = Text["Close Contacts"].texts;
const contactListIndex = Text["Close Contacts"].listIndex;
const contactLinkIndex = Text["Close Contacts"].linkIndex;
const travelText = Text["Recent Travel"].texts;
const travelListIndex = Text["Recent Travel"].listIndex;
const travelLinkIndex = Text["Recent Travel"].linkIndex;
const professions = Text["Profession"];
const medicalConditions = Text["Medical Conditions"];

const MAPBOX_APIKEY =
  "pk.eyJ1IjoieXVzMjUyIiwiYSI6ImNrYTZhM2VlcjA2M2UzMm1uOWh5YXhvdGoifQ.ZIzOiYbBfwJsV168m42iFg";

function CriticalQuestions(props) {
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState(initialFieldsState());

  const [contacts, setContacts] = useState([]);
  const [recentTravels, setRecentTravels] = useState([]);
  const [locationList, setListItems] = useState([]);

  let nextPage;
  const { story, status, travels, closeContacts } = useSelector(
    (state) => state.story
  );

  useEffect(() => {
    if (!story) {
      dispatch(fetchStory());
    } else {
      setFormValues({ ...formValues, ...story });
      if (travels.length) setRecentTravels(travels);
      if (closeContacts.length) setContacts(closeContacts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleRecentTravelChange = (key, index) => (event) => {
    const newTravel = recentTravels[index];
    if (key === "dateOfReturn")
      newTravel[key] = new Date(event)
        .toISOString()
        .substring(0, 10);
    else newTravel[key] = event.target.value;
    const newTravels = [...recentTravels];
    newTravels[index] = newTravel;
    setRecentTravels(newTravels);
  };

  const handleCloseContactChange = (key, index) => (event) => {
    const contactToUpdate = contacts[index];
    contactToUpdate[key] = event.target.value;
    const newContacts = [...contacts];
    newContacts[index] = contactToUpdate;
    setContacts(newContacts);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { ...story } = formValues;
    if (story.sick === sicknessStatus.NOT_SICK) nextPage = paths.dashboard;
    else nextPage = paths.symptoms;

    const dto = {
      story,
      nextPage,
      travels: recentTravels,
      closeContacts: contacts,
    };
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

  const closeContactsSection = () => (
    <>
      <div className={styles.formrow}>
        <Fab
          style={{ background: "#EA2027" }}
          aria-label="add"
          size="medium"
          className={styles.fab}
          onClick={() => setContacts([...contacts, {}])}
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
      {contacts.map((contact, i) => (
        <div key={i}>
          <div className={classNames("grid-3", styles["grid-3"])}>
            <TextField
              label="Email"
              value={contact.email}
              onChange={handleCloseContactChange("email", i)}
            />
          </div>
          <div className={classNames("grid-3", styles["grid-3"])}>
            <TextField
              label="Phone Number"
              value={contact.phoneNumber}
              onChange={handleCloseContactChange("phoneNumber", i)}
            />
          </div>
        </div>
      ))}
    </>
  );

  const travelsSection = () => (
    <>
      <div className={styles.formrow}>
        <Fab
          style={{ background: "#EA2027" }}
          aria-label="add"
          size="medium"
          className={styles.fab}
          onClick={() => setRecentTravels([...recentTravels, {}])}
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
      {recentTravels.map((travel, i) => (
        <div key={i}>
          <div className={classNames("grid-3", styles["grid-3"])}>
            <TextField
              label="Where did you travel to?"
              value={travel.location || ""}
              onChange={handleRecentTravelChange("location", i)}
            />
          </div>
          <div className={classNames("grid-3", styles["grid-3"])}>
            <DatePicker
              label="When did you return?"
              key={i}
              id={`travel-date-${i}`}
              clearable
              disableFuture
              value={travel.dateOfReturn || null}
              onChange={handleRecentTravelChange("dateOfReturn", i)}
            />
          </div>
        </div>
      ))}
    </>
  );

  const pageBottomRef = React.useRef(null);

  const scrollToBottom = () => {
    pageBottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(scrollToBottom, [contacts]);

  function removeDuplicates(array, key) {
    let lookup = {};
    let result = [];
    array.forEach((element) => {
      if (!lookup[element[key]]) {
        lookup[element[key]] = true;
        result.push(element);
      }
    });
    return result;
  }

  const onQuery = (event) => {
    let tempList = [];
    const query = event.target.value;
    const url =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      query +
      ".json?access_token=" +
      MAPBOX_APIKEY;
    setFormValues({
      ...formValues,
      city: query,
    });
    fetch(url)
      .then((response) => response.json())
      .then((jsondata) => {
        if ("features" in jsondata && jsondata.features.length > 0) {
          const places = jsondata.features;
          places.map((place) => {
            const place_name = place.place_name;
            const address = place_name.split(",");
            let city = "";
            let state = "";
            let country = "";
            if (address.length > 0) {
              country = address[address.length - 1].trim();
            }

            if (address.length > 1) {
              state = address[address.length - 2].trim().split(" ")[0];
            }
            if (address.length > 2) {
              city = address[address.length - 3].trim();
            }
            const result = { city: city, state: state, country: country };
            tempList.push(result);
          });
          setListItems(removeDuplicates(tempList, "state"));
        } else {
          setListItems([]);
        }
      })
      .then((error) => console.log(error));
  };

  return (
    <>
      {status && status.type === ERROR && (
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

          <Select
            id={fields.SEX.key}
            label={fields.SEX.label}
            value={formValues[fields.SEX.key]}
            onChange={handleFormChange(fields.SEX)}
            InputLabelProps={{
              shrink: formValues[fields.SEX.key] === null ? false : true,
            }}
          >
            <MenuItem value={"male"}>Male</MenuItem>
            <MenuItem value={"female"}>Female</MenuItem>
            <MenuItem value={"other"}>Other</MenuItem>
            <MenuItem>I prefer not to state</MenuItem>
          </Select>

          <Select
            label={fields.COUNTRY_OF_ORIGIN.label}
            value={formValues[fields.COUNTRY_OF_ORIGIN.key]}
            onChange={handleFormChange(fields.COUNTRY_OF_ORIGIN)}
          >
            {countries.map((option) => (
              <MenuItem key={option.name} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div
          className={classNames("location-wrapper", styles["location-wrapper"])}
        >
          <div className={classNames("grid-1", styles["grid-1"])}>
            <FormControl>
              <TextField
                label={fields.CITY.label}
                value={formValues[fields.CITY.key]}
                onChange={onQuery}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <FormHelperText style={{ fontSize: 12 }}>
                Current Location
              </FormHelperText>
              <List dense>
                {locationList.map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      setFormValues({
                        ...formValues,
                        city: item.city,
                        state: item.state,
                        country: item.country,
                      });
                      setListItems([]);
                    }}
                  >
                    <ListItemText>
                      {item.city}, {item.state}, {item.country}
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </FormControl>

            <TextField
              label={fields.STATE.label}
              value={formValues[fields.STATE.key]}
              onChange={handleFormChange(fields.STATE)}
              InputProps={{ inputProps: { min: 0 } }}
            />

            <TextField
              label={fields.COUNTRY.label}
              value={formValues[fields.COUNTRY.key]}
              onChange={handleFormChange(fields.COUNTRY)}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </div>
        </div>
        <div
          className={classNames("grid-2", styles["grid-2"])}
          style={{ paddingTop: 0 }}
        >
          <Select
            label={fields.PROFESSION.label}
            value={formValues[fields.PROFESSION.key]}
            onChange={handleFormChange(fields.PROFESSION)}
          >
            {professions.map((option) => (
              <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <FormControl>
            <Select
              label={fields.MEDICAL_CONDITIONS.label}
              value={formValues[fields.MEDICAL_CONDITIONS.key]}
              onChange={handleFormChange(fields.MEDICAL_CONDITIONS)}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => selected.join(", "),
              }}
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
        {closeContactsSection()}
        {travelsSection()}
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
