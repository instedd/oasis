import { Fab } from '@material-ui/core';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import classNames from 'classnames';
import Wrapper from 'components/Wrapper';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { testStatus } from 'routes/types';
import { handleTested } from '../../actions/handleTested';
import styles from './styles.module.css';

export default function Confirm(props) {
    const isSick = useSelector(state => state.post.sick)

    const dispatch = useDispatch();
    function handleClick(selected) {
        localStorage.setItem('tested', selected);
        dispatch(handleTested(selected));
    }

    return (
        <Wrapper>
            <h1 className={classNames("title", styles.title)}>HAVE YOUR BEEN TESTED FOR COVID-19?</h1>

            <div className={classNames("btn-group", styles.buttons)}>

                <Fab style={{ background: "#EA2027" }} size="large" className="fab" variant="extended" onClick={() => { handleClick(testStatus.POSITIVE); props.history.push("/questions") }}>
                    <span>YES, TESTED POSITIVE</span>
                </Fab>
                <Fab style={{ background: "#9206FF" }} size="large" className="fab" variant="extended" onClick={() => { handleClick(testStatus.NEGATIVE); props.history.push("/questions") }}>
                    <span>YES, TESTED NEGATIVE</span>
                </Fab>
                <Fab style={{ background: "#0559FD" }} size="large" className="fab" variant="extended" onClick={() => { handleClick(testStatus.NOT_TESTED); props.history.push("/questions") }}>
                    <span>NO, I HAVE NOT</span>
                </Fab>

            </div>
            <Fab style={{ background: "#9206FF" }} size="medium" className="fab back-btn" onClick={() => props.history.push(isSick === "sick" ? '/alert' : '/onboard')}>
                <ArrowLeftIcon />
            </Fab>
        </Wrapper>
    )
}
