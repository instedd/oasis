import React, { useState } from "react";
import { TextField, MenuItem, FormControl, InputLabel, Select, Checkbox, ListItemText, Input } from '@material-ui/core';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import { DatePicker } from "@material-ui/pickers";
import Pop from 'components/PopUp';
import Text from 'text.json';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { useSelector } from "react-redux";
import Wrapper from "components/Wrapper";
import styles from './styles.module.css';
import classNames from 'classnames';

const contactText = Text["Close Contacts"].texts
const contactListIndex = Text["Close Contacts"].listIndex
const contactLinkIndex = Text["Close Contacts"].linkIndex
const travelText = Text["Recent Travel"].texts
const travelListIndex = Text["Recent Travel"].listIndex
const travelLinkIndex = Text["Recent Travel"].linkIndex
const professions = Text["Profession"]
const medicalProblems = Text["Medical Problems"]

const ethnicities = [
    { value: 'American Indian or Alaska Native', label: 'American Indian or Alaska Native' },
    { value: 'Asian', label: 'Asian' },
    { value: 'Black or African American', label: 'Black or African American' },
    { value: 'Hispanic or Latino', label: 'Hispanic or Latino' },
    { value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
    { value: 'White', label: 'White' },
]

function CriticalQuestions(props) {
    const [sex, setSex] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [location, setLocation] = useState('');
    const [citizenship, setCitizenship] = useState('');
    const [profession, setProfession] = useState('');
    const [selectedDate, handleDateChange] = useState(null);
    const [selectedEndDate, handleEndDateChange] = useState(null);

    const [travelDates, setTravelDates] = useState({ 0: null });
    const [travelDatesIndex, setTravelDatesIndex] = useState(0);

    const [contactCount, setContactCount] = useState(0)
    const [locationCount, setLocationCount] = useState(0)

    const [selectedProblems, setMedicalProblems] = useState([]);

    const handleMedicalProblemChange = (event) => {
        setMedicalProblems(event.target.value);
    };
    const handleSexChange = (event) => {
        setSex(event.target.value);
    };
    const handleEthnicityChange = (event) => {
        setEthnicity(event.target.value);
    };
    const handleCitizenshipChange = (event) => {
        setCitizenship(event.target.value);
    };

    const handleProfessionChange = (event) => {
        setProfession(event.target.value);
    };

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    function handleTravelDateChange(date) {
        setTravelDates({ ...travelDates, [travelDatesIndex]: date });
    };

    const [countries, setCountries] = React.useState([]);

    const endPicker = <DatePicker
        autoOk
        label="When did your illness resolve?"
        clearable
        disableFuture
        value={selectedEndDate}
        onChange={handleEndDateChange}
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
    console.log(isSick, tested)
    if (isSick === "not sick") {
        nextPage = "/dashboard";
    }
    else if (tested === "positive") {
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
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                    {isSick === "recovered" ? endPicker : null}


                </div>
                <div className={classNames("grid-1", styles["grid-1"])}>
                    <TextField
                        id="standard-number"
                        label="Age"
                        type="number"
                    />

                    <TextField
                        id="standard-select-currency"
                        select
                        label="Sex"
                        value={sex}
                        onChange={handleSexChange}
                    >
                        <MenuItem value={"male"}>Male</MenuItem>
                        <MenuItem value={"female"}>Female</MenuItem>
                        <MenuItem value={"other"}>Other</MenuItem>
                        <MenuItem value={null}>I don't want to answer</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Ethnicity"
                        value={ethnicity}
                        onChange={handleEthnicityChange}
                    >
                        {ethnicities.map((option) => (
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
                        value={location}
                        onChange={handleLocationChange}
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
                        value={citizenship}
                        onChange={handleCitizenshipChange}
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
                        value={profession}
                        onChange={handleProfessionChange}
                    >
                        {professions.map((option) => (
                            <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <FormControl>
                        <InputLabel id="demo-mutiple-checkbox-label"
                        >Medical Problems</InputLabel>
                        <Select
                            labelId="demo-mutiple-checkbox-label"
                            id="demo-mutiple-checkbox"
                            multiple
                            value={selectedProblems}
                            input={<Input />}
                            onChange={handleMedicalProblemChange}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {medicalProblems.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={selectedProblems.indexOf(name) > -1} />
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
            <Fab style={{ background: "#EA2027" }} aria-label="add" size="medium" className="fab next-btn" onClick={() => props.history.push(nextPage)}>
                <ArrowRightIcon />
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="add" size="medium" className="fab back-btn" onClick={() => props.history.push('/confirm')}>
                <ArrowLeftIcon />
            </Fab>
        </Wrapper >
    )
}

export default CriticalQuestions;
