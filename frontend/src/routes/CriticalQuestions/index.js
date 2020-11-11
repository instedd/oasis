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
  Button,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
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
import AlertDialog from "components/Dialog";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { getGeocoding } from "utils";

const contactText = Text["Close Contacts"].texts;
const contactNoticeText = Text["Close Contacts Notice"].texts;
const contactListIndex = Text["Close Contacts"].listIndex;
const contactLinkIndex = Text["Close Contacts"].linkIndex;
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

  const [validEmails, setValidEmails] = useState([]);

  let nextPage;
  const { story, status, travels, closeContacts } = useSelector((state) => {
    return state.story;
  });

  // the number of times that the user clicks next
  const [next_count, setNextCount] = useState(0);

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

  const validateEmail = (email) => {
    // eslint-disable-next-line
    const validEmailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return validEmailFormat.test(email);
  };

  const validateEmailEntry = (entry) => {
    return validateEmail(entry.email);
  };

  const handleCloseContactChange = (key, index) => (event) => {
    const contactToUpdate = contacts[index];
    contactToUpdate[key] = event.target.value;
    if (key === "email") {
      const newValidEmails = validEmails;
      newValidEmails[index] = true;
      setValidEmails(newValidEmails);
    }
    const newContacts = [...contacts];
    newContacts[index] = contactToUpdate;
    setContacts(newContacts);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      next_count === 0 &&
      formValues[fields.STATE.key] &&
      formValues[fields.STATE.key].length &&
      formValues[fields.COUNTRY.key] &&
      formValues[fields.COUNTRY.key].length &&
      (!formValues[fields.CITY.key] || formValues[fields.CITY.key] === "")
    ) {
      document.getElementById("reminder").innerHTML =
        "It seems that you did not fill your city. You can type it out manually and then click next. ";
      if (document.getElementById("error")) {
        document.getElementById("error").style.display = "none";
      }
      setNextCount(next_count + 1);
    } else {
      if (document.getElementById("error")) {
        document.getElementById("error").style.display = "inline";
      }
      document.getElementById("reminder").innerHTML = "";
      getGeocoding(
        formValues[fields.CITY.key],
        formValues[fields.STATE.key],
        formValues[fields.COUNTRY.key]
      ).then((coordinates) => {
        const { ...story } = formValues;
        if (story.sick === sicknessStatus.NOT_SICK) nextPage = paths.dashboard;
        else nextPage = paths.symptoms;

        // check if the user has filled valid city, state, and country
        if (coordinates) {
          story.latitude = coordinates[1]; // coordinates = [lng, lat]
          story.longitude = coordinates[0];
        }

        // delete the contacts which have empty email and phone number
        var valid_contacts = contacts.filter((contact) => contact.email);

        // delete the travel which does not have date or location
        var valid_travels = recentTravels.filter(
          (travel) => travel.location && travel.dateOfReturn
        );

        const dto = {
          story,
          nextPage,
          travels: valid_travels,
          closeContacts: valid_contacts,
        };

        dispatch(submitStory(dto));
      });
    }
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
        {story && story.sick === sicknessStatus.SICK && (
          <Fab
            style={{ background: "#EA2027" }}
            aria-label="add"
            size="medium"
            className={styles.fab}
            onClick={() => setContacts([...contacts, {}])}
          >
            <AddIcon />
          </Fab>
        )}
        {story &&
          (story.sick === sicknessStatus.RECOVERED ||
            story.sick === sicknessStatus.NOT_SICK) && (
            <Fab
              style={{ background: "#D3D3D3" }}
              aria-label="add"
              size="medium"
              className={styles.fab}
            >
              <AddIcon />
            </Fab>
          )}
        <span>Close Contacts</span>
        <span className={styles.pop}>
          <Pop
            label={<HelpOutlineIcon />}
            title={
              <span className={styles.sickAlert}>
                You can send annoymous emails to inform your close contacts if
                you are sick
              </span>
            }
            texts={contactText}
            linkIndex={contactLinkIndex}
            listIndex={contactListIndex}
          />
        </span>
      </div>
      {contacts.map((contact, i) => (
        <div key={i} className={styles.contact}>
          <div className={classNames("grid-3", styles["grid-3"])}>
            <TextField
              error={contact.email && !validateEmail(contact.email)}
              label="Email *"
              value={contact.email}
              onChange={handleCloseContactChange("email", i)}
              helperText={
                contact.email && !validateEmail(contact.email)
                  ? "Please enter a valid email."
                  : null
              }
            />
          </div>

          <div className={classNames("grid-3", styles["grid-3"])}>
            <TextField
              label="Phone Number"
              value={contact.phoneNumber}
              onChange={handleCloseContactChange("phoneNumber", i)}
            />
          </div>
          <Button
            onClick={() =>
              setContacts(contacts.filter((el, i) => i !== contacts.length - 1))
            }
          >
            <DeleteForeverIcon />
            Delete this contact
          </Button>
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
          places.forEach((place) => {
            const place_name = place.place_name;
            const address = place_name.split(",");
            let city = "";
            let state = "";
            let country = "";
            if (address.length > 0) {
              country = address[address.length - 1].trim();
            }

            if (address.length > 1) {
              state = address[address.length - 2].trim();
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
      });
  };

  return (
    <>
      <p id="reminder" className={classNames(styles.status, styles.error)}>
        {" "}
      </p>
      {status && status.type === ERROR && status.detail !== "Story not found" && (
        <p className={classNames(styles.status, styles.error)} id="error">
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
              <List dense id="on_list">
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
                {formValues[fields.CITY.key] &&
                  formValues[fields.CITY.key].length && (
                    <ListItem
                      key="off"
                      button
                      onClick={() => {
                        document.getElementById("on_list").style.display =
                          "none";
                      }}
                    >
                      <ListItemText style={{ color: "red" }}>
                        Turn Off Adrress Autocompletion
                      </ListItemText>
                    </ListItem>
                  )}
              </List>
              <List dense id="off_list">
                {formValues[fields.CITY.key] &&
                  formValues[fields.CITY.key].length &&
                  document.getElementById("on_list").style.display ===
                    "none" && (
                    <ListItem
                      key="on"
                      button
                      onClick={(e) => {
                        document.getElementById("on_list").style.display =
                          "inline";
                        document.getElementById("off_list").style.display =
                          "none";
                      }}
                    >
                      <ListItemText style={{ color: "green" }}>
                        Turn On Adrress Autocompletion
                      </ListItemText>
                    </ListItem>
                  )}
              </List>
            </FormControl>

            <TextField
              label={fields.STATE.label + " *"}
              value={formValues[fields.STATE.key]}
              onChange={handleFormChange(fields.STATE)}
              InputProps={{ inputProps: { min: 0 } }}
            />

            <TextField
              label={fields.COUNTRY.label + " *"}
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
        <div style={{ height: "30px" }} ref={pageBottomRef}></div>
      </div>

      {(contacts.filter((contact) => contact.email).length === 0 ||
        !formValues[fields.CITY.key] ||
        !formValues[fields.CITY.key].length ||
        !formValues[fields.STATE.key] ||
        !formValues[fields.STATE.key].length ||
        !formValues[fields.COUNTRY.key] ||
        !formValues[fields.COUNTRY.key].length) && (
        <Fab
          style={{ background: "#EA2027" }}
          aria-label="Go to next page"
          size="medium"
          className="fab next-btn"
          onClick={handleSubmit}
        >
          <ArrowRightIcon />
        </Fab>
      )}

      {contacts.filter((contact) => contact.email).length !== 0 &&
        ((next_count === 0 &&
          !!(
            formValues[fields.CITY.key] && formValues[fields.CITY.key].length
          )) ||
          next_count > 0) &&
        formValues[fields.STATE.key] &&
        formValues[fields.STATE.key].length &&
        formValues[fields.COUNTRY.key] &&
        formValues[fields.COUNTRY.key].length && (
          <AlertDialog
            label={
              <Fab
                style={{ background: "#EA2027" }}
                aria-label="Go to next page"
                size="medium"
                className="fab next-btn"
              >
                <ArrowRightIcon />
              </Fab>
            }
            valid={contacts
              .filter((contact) => contact.email)
              .every(validateEmailEntry)}
            text={contactNoticeText}
            submit={handleSubmit}
          />
        )}

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
