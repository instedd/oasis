import React from 'react'
import { TextField, Fab, Typography, Slider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

// const styles = theme => ({
//     root: {
//         position: 'absolute',
//         width: '80vw',
//         top: '30%;',
//         left: 'calc(10vw - 8px)',
//         '& > *': {
//             margin: theme.spacing(1),
//             width: '100%',
//         },
//     },
//     input: {
//         color: 'white',
//         '&:before': {
//             borderBottom: '1px solid white',
//         },

//     },
//     label: {
//         color: 'white',
//         width: 'max-content'
//     },
// });
const iOSBoxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';
const CustomSlider = withStyles({
    root: {
      color: 'rgb(234, 32, 39)',
      height: 2,
    //   padding: '15px 0',
    },
    thumb: {
    //   height: 28,
    //   width: 28,
      backgroundColor: '#fff',
    //   boxShadow: iOSBoxShadow,
    //   marginTop: -14,
    //   marginLeft: -14,
    //   '&:focus, &:hover, &$active': {
    //     boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
    //     // Reset on touch devices, it doesn't add specificity
    //     '@media (hover: none)': {
    //       boxShadow: iOSBoxShadow,
    //     },
    //   },
    },
    // active: {},
    // valueLabel: {
    //   left: 'calc(-50% + 11px)',
    //   top: -22,
    //   '& *': {
    //     background: 'transparent',
    //     color: '#000',
    //   },
    // },
    track: {
      height: 5,
    },
    rail: {
      height: 5,
      opacity: 0.5,
      backgroundColor: '#bfbfbf',
    },
    mark:{
        backgroundColor: 'transparent',
        height: 5,
        width: 1,
        marginTop: -2,
    },
    markLabel: {
    //   backgroundColor: '#bfbfbf',
    //   height: 8,
    //   width: 1,
    //   marginTop: -3,
      color:"white"
    },
    // markActive: {
    //   opacity: 1,
    //   backgroundColor: 'currentColor',
    // },
  })(Slider);

function HealthMeasurements(props) {
    const { classes } = props;
    const [temp, setTemp] = React.useState(92);
    const [heartRate, setHeartRate] = React.useState(30);
    const [pulseOxygen, setPulseOxygen] = React.useState(60);

    const handleTempChange = (event, newValue) => {
        setTemp(newValue);
    };
    const handleHeartRateChange = (event, newValue) => {
        setHeartRate(newValue);
    };
    const handlePulseOxygenChange = (event, newValue) => {
        setPulseOxygen(newValue);
    };

    const tempMarks = [
        {
            value: 92,
            label: '91°F',
        },
        {
            value: 108,
            label: '108°F',
        },
    ];
    const heartRateMarks = [
        {
            value: 30,
            label: '30 bpm',
        },
        {
            value: 220,
            label: '220 bpm',
        },
    ];
    const pulseOxygenMarks = [
        {
            value: 60,
            label: '60% SpO2',
        },
        {
            value: 100,
            label: '100% SpO2',
        },
    ];
    function tempText(value) {
        return `${value}°F`;
    }
    function heartRateText(value) {
        return `${value}bpm`;
    }
    function pulseOxygenText(value) {
        return `${value}%`;
    }

    return (
        <div className="HealthMeasurements">
            <h1 className="title"> MY COVID STORY</h1>
            <div className="sliders-wrapper">
                <Typography id="temp-slider" gutterBottom>Temperature</Typography>
                <CustomSlider
                    value={temp}
                    min={92}
                    max={108}
                    step={0.1}
                    onChange={handleTempChange}
                    valueLabelDisplay="auto"
                    defaultValue={92}
                    aria-labelledby="temp-slider"
                    getAriaValueText={tempText}
                    marks={tempMarks}
                    // label
                />
                <Typography id="heart-rate-slider" gutterBottom>Heart Rate</Typography>
                <CustomSlider
                    value={heartRate}
                    min={30}
                    max={220}
                    step={1}
                    onChange={handleHeartRateChange}
                    valueLabelDisplay="auto"
                    defaultValue={92}
                    aria-labelledby="heart-rate-slider"
                    getAriaValueText={heartRateText}
                    marks={heartRateMarks}
                    // label
                />
                <Typography id="pulse-oxygen-slider" gutterBottom>Pulse Oxygen</Typography>
                <CustomSlider
                    value={pulseOxygen}
                    min={60}
                    max={100}
                    step={1}
                    onChange={handlePulseOxygenChange}
                    valueLabelDisplay="auto"
                    defaultValue={92}
                    aria-labelledby="pulse-oxygen-slider"
                    getAriaValueText={pulseOxygenText}
                    marks={pulseOxygenMarks}
                    // label
                />
                {/* <TextField
                    id="HeartRate"
                    label="Heart Rate (BPM)"
                    type="number"
                    InputProps={{ className: classes.input }}
                    InputLabelProps={{
                        className: classes.label
                    }}
                />
        
                <TextField
                    id="standard-number"
                    label="Max Temperature (F)"
                    type="number"
                    InputProps={{ className: classes.input }}
                    InputLabelProps={{
                        className: classes.label
                    }}
                />
                <TextField
                    id="standard-number"
                    label="Pulse Oxygen (%sp02)"
                    type="number"
                    InputProps={{ className: classes.input }}
                    InputLabelProps={{
                        className: classes.label
                    }}
                /> */}
            </div>
            <Fab style={{ background: "#EA2027" }} aria-label="add" size="medium" className="fab next-btn" onClick={()=>props.history.push('/dashboard')}>
                <ArrowRightIcon />
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="add" size="medium" className="fab back-btn" onClick={()=>props.history.push('/symptoms')}>
                <ArrowLeftIcon />
            </Fab>
        </div>
    )
}

export default HealthMeasurements;
