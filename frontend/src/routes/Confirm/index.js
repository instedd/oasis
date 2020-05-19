import React from 'react'
import { Fab } from '@material-ui/core';
import classNames from 'classnames';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft'
import { handleTested} from '../../actions/handleTested';
import { useDispatch, useSelector } from 'react-redux'
import Wrapper from 'components/Wrapper';
import styles from './styles.module.css'

export default function Confirm(props) {
    const isSick = useSelector(state => state.post.sick)

    const dispatch = useDispatch();
    function handleClick(selected) {
        localStorage.setItem('tested', selected);
        dispatch(handleTested(selected));
    }

    return (
        <Wrapper>
            <h1 className="title">HAVE YOUR BEEN TESTED FOR COVID-19?</h1>
           
            <div className={classNames("btn-group", styles.buttons)}>
                <div className="yes-btn">
                    <Fab style={{ background: "#EA2027" }} size="large" className="fab" variant="extended" onClick={()=>{handleClick('positive');props.history.push("/questions")}}>
                        <span>YES, TESTED POSITIVE</span>
                    </Fab>
                </div>
                <div className="yes-btn">
                    <Fab style={{ background: "#9206FF" }} size="large" className="fab" variant="extended" onClick={()=>{handleClick('negative');props.history.push("/questions")}}>
                        <span>YES, TESTED NEGATIVE</span>
                    </Fab>
                </div>
                <div className="no-btn">
                    <Fab style={{ background: "#0559FD" }} size="large" className="fab" variant="extended" onClick={()=>{handleClick('not tested');props.history.push("/questions")}}>
                        <span>NO, I HAVE NOT</span>
                    </Fab>
                </div>

            </div>
            <Fab style={{ background: "#9206FF" }} size="medium" className="fab back-btn" onClick={()=>props.history.push(isSick==="sick"?'/alert':'/onboard')}>
                <ArrowLeftIcon />
            </Fab>
        </Wrapper>
    )
}