import { Checkbox, Fab, FormControl, Input, InputLabel, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { DatePicker } from "@material-ui/pickers";
import { setStory } from "actions/handleSick";
import { submitStory } from 'actions/story';
import classNames from 'classnames';
import Pop from 'components/PopUp';
import Wrapper from "components/Wrapper";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Text from 'text.json';
import { sicknessStatus, testStatus } from '../types';
import styles from './styles.module.css';

const contactText = Text["Close Contacts"].texts
const contactListIndex = Text["Close Contacts"].listIndex
const contactLinkIndex = Text["Close Contacts"].linkIndex
const travelText = Text["Recent Travel"].texts
const travelListIndex = Text["Recent Travel"].listIndex
const travelLinkIndex = Text["Recent Travel"].linkIndex
const professions = Text["Profession"]
const medicalProblems = Text["Medical Problems"]

const ethnicGroups = [
    { value: 'American Indian or Alaska Native', label: 'American Indian or Alaska Native' },
    { value: 'Asian', label: 'Asian' },
    { value: 'Black or African American', label: 'Black or African American' },
    { value: 'Hispanic or Latino', label: 'Hispanic or Latino' },
    { value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
    { value: 'White', label: 'White' },
]

function CriticalQuestions(props) {
    const dispatch = useDispatch();

    const [formValues, setFormValues] = useState({
        age: '',
        sex: '',
        ethnicity: '',
        location: '',
        citizenship: '',
        profession: '',
        selectedMedicalProblems: []
      });

    const [sicknessStart, handleSicknessStartChange] = useState(null);
    const [sicknessEnd, handleSicknessEndChange] = useState(null);

    const [travelDates, setTravelDates] = useState({ 0: null });
    const [travelDatesIndex, setTravelDatesIndex] = useState(0);

    const [contactCount, setContactCount] = useState(0)
    const [locationCount, setLocationCount] = useState(0)

    const handleFormChange = (key) => (event) => {
        setFormValues({...formValues, [key]: event.target.value});
    }

    function handleTravelDateChange(date) {
        setTravelDates({ ...travelDates, [travelDatesIndex]: date });
    };

    const handleSubmit = (event) => {
        event.preventDefault()
        const story = {
            age: formValues.age, 
            sex: formValues.sex, 
            ethnicity: formValues.ethnicity, 
            countryOfOrigin: formValues.citizenship, 
            profession: formValues.profession, 
            sick: isSick, 
            tested: tested, 
            medicalProblems: formValues.selectedMedicalProblems, 
            sicknessStart: sicknessStart, 
            sicknessEnd: sicknessEnd,
            currentLocation: formValues.location
        }
        const dto = {story, nextPage}
        dispatch(submitStory(dto))
    };

    const [countries, setCountries] = React.useState([]);

    const sicknessEndPicker = <DatePicker
        autoOk
        label="When did your illness resolve?"
        clearable
        disableFuture
        value={sicknessEnd}
        onChange={handleSicknessEndChange}
    />

    React.useEffect(() => {
        fetch("https://restcountries.eu/rest/v2/all?fields=name")
            .then(res => res.json())
            .then(
                (result) => {
                    setCountries(result);
                },
                () => {
                }
            )
    }, [])


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
            </div>)
    }

    const locations = [];
    for (let i = 0; i < locationCount; i++) {
        locations.push(
            <div key={i}>
                <div className={classNames("grid-3", styles["grid-3"])}>
                    <TextField label="Location" />
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
            </div>)
    }

    const pageBottomRef = React.useRef(null)

    const scrollToBottom = () => {
        pageBottomRef.current.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(scrollToBottom, [locations]);
    React.useEffect(scrollToBottom, [contacts]);
    let nextPage;
    const isSick = useSelector(state => state.post.sick);
    const tested = useSelector(state => state.post.tested);
    if (isSick === sicknessStatus.NOT_SICK) {
        nextPage = "/dashboard";
    }
    else if (tested === testStatus.POSITIVE) {
        nextPage = "/symptoms"
    }
    else {
        nextPage = "/symptoms"
    }

    return (
        <Wrapper>
            <h1 className="title"> MY COVID STORY</h1>
            <div className={classNames("root", styles.root)}>
                <div className={classNames("grid-3", styles["grid-3"])}>

                    <DatePicker
                        autoOk
                        label="When did you first start feeling sick?"
                        clearable
                        disableFuture
                        value={sicknessStart}
                        onChange={handleSicknessStartChange}
                    />
                    {isSick === sicknessStatus.RECOVERED ? sicknessEndPicker : null}


                </div>
                <div className={classNames("grid-1", styles["grid-1"])}>
                    <TextField
                        id="age"
                        label="Age"
                        type="number"
                        value={formValues.age}
                        onChange={handleFormChange('age')}
                    />

                    <TextField
                        id="sex"
                        select
                        label="Sex"
                        value={formValues.sex}
                        onChange={handleFormChange('sex')}
                    >
                        <MenuItem value={"male"}>Male</MenuItem>
                        <MenuItem value={"female"}>Female</MenuItem>
                        <MenuItem value={"other"}>Other</MenuItem>
                        <MenuItem value={null}>I don't want to answer</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Ethnicity"
                        value={formValues.ethnicity}
                        onChange={handleFormChange('ethnicity')}
                    >
                        {ethnicGroups.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
                <div className={classNames("grid-2", styles["grid-2"])}>
                    <TextField
                        select
                        label="Current Location"
                        value={formValues.location}
                        onChange={handleFormChange('location')}
                    >
                        {countries.map((option) => (
                            <MenuItem key={option.name} value={option.name}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Citizenship"
                        value={formValues.citizenship}
                        onChange={handleFormChange('citizenship')}
                    >
                        {countries.map((option) => (
                            <MenuItem key={option.name} value={option.name}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>

                </div>
                <div className={classNames("grid-2", styles["grid-2"])}>
                    <TextField
                        select
                        label="Profession"
                        value={formValues.profession}
                        onChange={handleFormChange('profession')}
                    >
                        {professions.map((option) => (
                            <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <FormControl>
                        <InputLabel id="medical-problems">Medical Problems</InputLabel>
                        <Select
                            labelId="medical-problems"
                            id="medical-problems-checkbox"
                            multiple
                            value={formValues.selectedMedicalProblems}
                            input={<Input />}
                            onChange={handleFormChange('selectedMedicalProblems')}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {medicalProblems.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={formValues.selectedMedicalProblems.indexOf(name) > -1} />
                                    <ListItemText primary={name} className={classNames("checkbox-label", styles["checkbox-label"])} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <div className={classNames("form-row contacts", styles.contacts)} >
                    <Fab style={{ background: "#EA2027" }} aria-label="add" size="medium" className="fab" onClick={() => setContactCount(contactCount + 1)}>
                        <AddIcon />
                    </Fab>
                    <p>Close Contacts</p>
                    <Pop
                        label={<ErrorOutlineIcon />}
                        title={<span></span>}
                        texts={contactText}
                        linkIndex={contactLinkIndex}
                        listIndex={contactListIndex} />

                </div>
                {contacts}
                <div className={classNames("form-row travels", styles.travels)}>
                    <Fab style={{ background: "#EA2027" }} aria-label="add" size="medium" className="fab" onClick={() => setLocationCount(locationCount + 1)}>
                        <AddIcon />
                    </Fab>
                    <p>Recent Travels</p>
                    <Pop
                        label={<ErrorOutlineIcon />}
                        title={<span></span>}
                        texts={travelText}
                        linkIndex={travelLinkIndex}
                        listIndex={travelListIndex} />
                </div>
                {locations}
                <div style={{ height: '30px' }} ref={pageBottomRef}></div>
            </div>
            <Fab style={{ background: "#EA2027" }} aria-label="Go to next page" size="medium" className="fab next-btn" onClick={(event) =>{
                dispatch(setStory({
                    citizenship: formValues.citizenship,
                    location: formValues.location
                }));
                handleSubmit(event)
                }}>
                <ArrowRightIcon />
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="Go to previous page" size="medium" className="fab back-btn" onClick={() => {
                dispatch(setStory({
                    citizenship: formValues.citizenship,
                    location: formValues.location
                }));
                props.history.goBack()
                }}>
                <ArrowLeftIcon />
            </Fab>
        </Wrapper >
    )
}

export default CriticalQuestions;
