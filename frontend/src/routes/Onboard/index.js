import React from 'react'
import { Fab } from '@material-ui/core'
import { handleSick } from '../../actions/handleSick';
import { useDispatch } from 'react-redux'
import classNames from 'classnames';
import Wrapper from 'components/Wrapper';

import styles from './styles.module.css';

export default function Onboard(props) {

    const dispatch = useDispatch();
    function handleClick(selected) {
        localStorage.setItem('isSick', selected);
        dispatch(handleSick(selected));
    }
    return (
        <Wrapper>
            <h1 className="title">MY COVID STORY</h1>
            <div className={classNames("btn-group", styles.buttons)}>
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
        </Wrapper>
    )
}

