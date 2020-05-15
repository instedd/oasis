import React, { useState } from "react";
import { TextField, MenuItem, FormControl, InputLabel, Select, Checkbox, ListItemText,Input } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import { DatePicker } from "@material-ui/pickers";
import Pop from '../elements/Pop';
import Text from '../text.json';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { useSelector } from "react-redux";


const contactText = Text["Close Contacts"].texts
const contactListIndex = Text["Close Contacts"].listIndex
const contactLinkIndex = Text["Close Contacts"].linkIndex
const travelText = Text["Recent Travel"].texts
const travelListIndex = Text["Recent Travel"].listIndex
const travelLinkIndex = Text["Recent Travel"].linkIndex
const professions = Text["Profession"]
const medicalProblems = Text["Medical Problems"]

const ethnicities = [
    { value: 'White', label: 'White' },
    { value: 'American Indian or Alaska Native', label: 'American Indian or Alaska Native' },
    { value: 'Asian', label: 'Asian' },
    { value: 'Black or African American', label: 'Black or African American' },
    { value: 'Hispanic or Latino', label: 'Hispanic or Latino' },
    { value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
]
const styles = theme => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '25ch',
        },
        textAlign: 'left',
        width: '90vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: 'max-content',
        maxHeight: '69%'
    },
    input: {
        color: 'white',
        '&:before': {
            borderBottom: '1px solid white',
        },

    },
    label: {
        color: 'white',
        width: 'max-content'
    },
});

function CriticalQuestions(props) {
    const { classes } = props;
    const [sex, setSex] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [origin, setOrigin] = useState('');
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
    const handleOriginChange = (event) => {
        setOrigin(event.target.value);
    };

    const handleProfessionChange = (event) => {
        setProfession(event.target.value);
    };


    function handleTravelDateChange(date) {
        console.log(travelDatesIndex);
        setTravelDates({ ...travelDates, [travelDatesIndex]: date });

        console.log(travelDates);

    };


    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [countries, setCountries] = React.useState([]);

    const endPicker = <DatePicker
        autoOk
        label="When did your illness resolve?"
        clearable
        disableFuture
        value={selectedEndDate}
        onChange={handleEndDateChange}
        InputProps={{ className: classes.input }}
        InputLabelProps={{ className: classes.label }}
    />

    React.useEffect(() => {
        fetch("https://restcountries.eu/rest/v2/all?fields=name")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setCountries(result);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])


    const contacts = [];
    for (let i = 0; i < contactCount; i++) {
        contacts.push(
            <div key={i}>
                <TextField label="Email" InputProps={{ className: classes.input }}
                    InputLabelProps={{ className: classes.label }} />
                <TextField label="Phone Number" InputProps={{ className: classes.input }}
                    InputLabelProps={{ className: classes.label }} />
            </div>)
    }

    const locations = [];
    for (let i = 0; i < locationCount; i++) {
        locations.push(
            <div key={i}>
                <TextField label="Location" InputProps={{ className: classes.input }}
                    InputLabelProps={{ className: classes.label }} />
                <DatePicker
                    // autoOk
                    label="Date"
                    key={i}
                    id={`hi-${i}`}
                    clearable
                    disableFuture
                    value={travelDates[i]}
                    onOpen={() => setTravelDatesIndex(i)}
                    onChange={(date) => handleTravelDateChange(date)}
                    InputProps={{ className: classes.input }}
                    InputLabelProps={{ className: classes.label }}
                />
            </div>)
    }

    const pageBottomRef = React.useRef(null)

    const scrollToBottom = () => {
        pageBottomRef.current.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(scrollToBottom, [locations]);
    React.useEffect(scrollToBottom, [contacts]);
    let showDatePicker;
    let nextPage;
    const isSick = useSelector(state => state.post.sick);
    const tested = useSelector(state => state.post.tested);
    console.log(isSick, tested)
    if (isSick === "not sick") {
        nextPage = "/dashboard";
        if (tested === "not tested")
            showDatePicker = "hidden";
        else if (tested === "positive") {
            showDatePicker = "";
            nextPage = "/symptoms"
        }
        else {
            showDatePicker = "";
        }
    }
    else {
        showDatePicker = "";
        nextPage = "/symptoms"
    }

    return (
        <div className="CriticalQuestions">
            <h1 className="title"> MY COVID STORY</h1>
            <div className={classes.root}>
                <form noValidate>
                    <div className={showDatePicker}>

                        <DatePicker
                            autoOk
                            label="When did you first start feeling sick?"
                            clearable
                            disableFuture
                            value={selectedDate}
                            onChange={handleDateChange}
                            InputProps={{ className: classes.input }}
                            InputLabelProps={{ className: classes.label }}
                        />
                        {isSick === "recovered" ? endPicker : null}


                    </div>
                    <div className="demographics">
                        <TextField
                            id="standard-number"
                            label="Age"
                            type="number"
                            InputProps={{ className: classes.input }}
                            InputLabelProps={{ className: classes.label }}
                        />

                        <TextField
                            id="standard-select-currency"
                            select
                            label="Sex"
                            value={sex}
                            onChange={handleSexChange}
                            InputProps={{ className: classes.input }}
                            InputLabelProps={{ className: classes.label }}
                        >
                            <MenuItem value={"male"}>Male</MenuItem>
                            <MenuItem value={"female"}>Female</MenuItem>
                            <MenuItem value={"female"}>Non Binary</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Ethnicity"
                            value={ethnicity}
                            onChange={handleEthnicityChange}
                            InputProps={{ className: classes.input }}
                            InputLabelProps={{ className: classes.label }}
                        >
                            {ethnicities.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="demographics">
                        <TextField
                            select
                            label="Origin"
                            value={origin}
                            onChange={handleOriginChange}
                            InputProps={{ className: classes.input }}
                            InputLabelProps={{ className: classes.label }}
                        >
                            {countries.map((option) => (
                                <MenuItem key={option.name} value={option.name}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Profession"
                            value={profession}
                            onChange={handleProfessionChange}
                            InputProps={{ className: classes.input }}
                            InputLabelProps={{ className: classes.label }}
                        >
                            {professions.map((option) => (
                                <MenuItem style={{ fontSize: 13 }} key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* <TextField id="standard-required" label="Profession" InputProps={{ className: classes.input }}
                            InputLabelProps={{
                                className: classes.label
                            }} /> */}
                    </div>
                    <div className="form-row"><FormControl className={classes.formControl}>
                        <InputLabel id="demo-mutiple-checkbox-label"  
                            InputLabelProps={{ className: classes.label }}>Tag</InputLabel>
                        <Select
                            labelId="demo-mutiple-checkbox-label"
                            id="demo-mutiple-checkbox"
                            multiple
                            value={selectedProblems}
                            input={<Input InputProps={{ className: classes.input }}/>}
                            onChange={handleMedicalProblemChange}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {medicalProblems.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={selectedProblems.indexOf(name) > -1}/>
                                        <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl></div>
                        <div className="form-row">
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
                        <div className="form-row">
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
                        <div style={{ height: '20px' }} ref={pageBottomRef}></div>
                </form>
            </div>
                <Fab style={{ background: "#EA2027" }} aria-label="add" size="medium" className="fab next-btn" onClick={() => props.history.push(nextPage)}>
                    <ArrowRightIcon />
                </Fab>
                <Fab style={{ background: "#9206FF" }} aria-label="add" size="medium" className="fab back-btn" onClick={() => props.history.push('/confirm')}>
                    <ArrowLeftIcon />
                </Fab>
            </div>
    )
}

export default withStyles(styles)(CriticalQuestions);