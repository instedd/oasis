import React, { useState }  from 'react'
import { withStyles } from '@material-ui/core/styles';
import {Fab, Slider, Typography} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import Wrapper from "components/Wrapper";
import styles from './styles.module.css'

export default function Feeling(props) {
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
        mark: {
            backgroundColor: 'transparent',
            height: 5,
            width: 1,
            marginTop: -2,
        },
        markLabel: {
            color: "white"
        },
    })(Slider);

    const feelingMarks = [
        {
            value: 0,
            label: 'Not ill',
        },
        {
            value: 2.5,
            label: 'Mildly ill',
        },
        {
            value: 6,
            label: 'Moderately ill',
        },
        {
            value: 10,
            label: 'Severely ill',
        },
    ];


    const handleFeelingChange = (event, newValue) => {
        setFeeling(newValue);
    };

    const [feeling, setFeeling] = useState(0)

    return (
        <Wrapper>
            <h1 className="title"> MY COVID STORY</h1>
              <div className={styles.feeling-wrapper}>
                <Typography id="feeling-slider" gutterBottom>How are you feeling today?</Typography>
                <CustomSlider
                    value={feeling}
                    min={0}
                    max={10}
                    step={1}
                    onChange={handleFeelingChange}
                    valueLabelDisplay="auto"
                    defaultValue={0}
                    aria-labelledby="feeling-slider"
                    marks={feelingMarks}
                />
            </div>
            <Fab style={{ background: "#EA2027" }} aria-label="add" size="medium" className="fab next-btn" onClick={() => props.history.push("/symptoms")}>
                <ArrowRightIcon />
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="add" size="medium" className="fab back-btn" onClick={() => props.history.push('/questions')}>
                <ArrowLeftIcon />
            </Fab>
        </Wrapper>
    )
}
