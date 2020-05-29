import React from 'react'
import { Fab, Typography, Slider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Wrapper from 'components/Wrapper';

const CustomSlider = withStyles({
    root: {
      color: 'rgb(234, 32, 39)',
      height: 2,
    },
    thumb: {
      backgroundColor: '#fff',
    },
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
      color:"white"
    },
  })(Slider);

function HealthMeasurements(props) {
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
        <Wrapper>
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
                />
            </div>
            <Fab style={{ background: "#EA2027" }} aria-label="Go to next page" size="medium" className="fab next-btn" onClick={()=>props.history.push('/dashboard')}>
                <ArrowRightIcon />
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="Go to previous page" size="medium" className="fab back-btn" onClick={()=>props.history.push('/symptoms')}>
                <ArrowLeftIcon />
            </Fab>
        </Wrapper>
    )
}

export default HealthMeasurements;
