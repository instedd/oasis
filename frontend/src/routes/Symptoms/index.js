import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Fab, FormGroup, FormControlLabel, FormControl, Checkbox, TextField} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import CheckCircle from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { useSelector } from 'react-redux';
import Text from 'text.json';
import Wrapper from 'components/Wrapper';
import styles from './styles.module.css';

const symptoms = Text["Symptoms"]

const useStyles = makeStyles((theme) => ({
    root: {
        width: '90vw',
        overflow: 'auto',
        height: 'max-content'
    },
    group: {
        '& > *': {
            margin: 0,
            width: '30vw',
        },
        '& .MuiTypography-body1': {
            fontSize: 14,
            fontFamily: 'abel'
        }

    },
    input: {
        color: 'white',
        '&:before': {
            borderBottom: '1px solid white',
        },

    },
    label: {
        color: 'white',
        width: 'max-content',
        fontSize: 15
    },
    others: {
        '& > *': {
            marginTop: theme.spacing(-1),
            marginBottom: theme.spacing(2),
            width: '80%',
        },
        width: '100vw',
    },
}));


export default function Symptoms(props) {
    const classes = useStyles();
    const isSick = useSelector(state => state.post.sick)
    const subtitle = isSick === "recovered" ? "When you were sick, which of the following symptoms did you have?" : "Are you having now, or did you recently have:"
    return (
        <Wrapper>
            <h1 className="title"> MY COVID STORY</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            <FormControl className={classes.root} component="fieldset">
                <FormGroup className={classes.group} aria-label="position" row>
                    {symptoms.map((option) => (
                        <FormControlLabel
                            value={option}
                            control={<Checkbox style={{ color: "white" }} icon={<RadioButtonUncheckedIcon style={{ fontSize: 30 }} />} checkedIcon={<CheckCircle style={{ fontSize: 30 }} />} />}
                            label={option}
                            key={option}
                            labelPlacement="top"
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
                        className: classes.label
                    }}
                />
            </div>
            <Fab style={{ background: "#EA2027" }} aria-label="Go to next page" onClick={() => props.history.push("/measurements")} size="medium" className="fab next-btn">
                <ArrowRightIcon />
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="Go to previous page" onClick={() => props.history.push("/questions")} size="medium" className="fab back-btn">
                <ArrowLeftIcon />
            </Fab>
        </Wrapper>
    )
}
