import React from 'react'
import { Fab } from '@material-ui/core'
import { handleSick } from '../actions/handleSick';
import { useDispatch } from 'react-redux'

export default function Onboard(props) {

    const dispatch = useDispatch();
    function handleClick(selected) {
        dispatch(handleSick(selected));
    }
    return (
        <div className="Onboard">
            <h1 className="title">MY COVID STORY</h1>
            <div className="btn-group">
                <Fab style={{ background: "#EA2027" }} variant="extended" className="fab sick-btn" onClick={() => { handleClick('sick'); props.history.push('/alert') }}>
                    <span>I AM SICK</span>
                </Fab>
                <Fab style={{ background: "#9206FF" }} variant="extended" className="fab not-sick-btn" onClick={() => { handleClick('not sick'); props.history.push('/confirm') }}>
                    <span>I AM NOT SICK</span>
                </Fab>
                <Fab style={{ background: "#0559FD" }} variant="extended" className="fab not-sick-btn" onClick={() => { handleClick('recovered'); props.history.push('/confirm') }}>
                    <span>I AM RECOVERED</span>
                </Fab>
            </div>
        </div>
    )
}

