import React from 'react'
import { TextField, Fab } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

const useStyles = makeStyles((theme) => ({
    input: {
        color: 'white',
        '&:before': {
            borderBottom: '1px solid white',
        },
    }
}))

export default function MyStory(props) {
    const classes = useStyles();
    const [story, setStory] = React.useState('');

    const handleChange = (event) => {
        setStory(event.target.value);
    };

    return (
        <div className="MyStory">
            <h1 className="title">MY COVID-19 STORY</h1>
            <h3 className="subtitle">Your COVID-19 story in your own words</h3>
            <TextField
                id="outlined-multiline-static"
                label="Tell a little about yourself, how you think you got sick and what the experience has been like"
                multiline
                rowsMax={10}
                value={story}
                onChange={handleChange}
                InputProps={{ className: classes.input }}
                InputLabelProps={{ className: classes.label }}
                variant="outlined"
            />
             <Fab style={{ background: "#EA2027", marginTop: '1.5rem' }} aria-label="add" size="medium" className="fab" variant="extended">
                SUBMIT
            </Fab>
            <Fab style={{ background: "#9206FF" }} aria-label="add" onClick={() => props.history.push("/dashboard")} size="medium" className="fab back-btn">
                <ArrowLeftIcon />
            </Fab>
        </div>
    )
}
