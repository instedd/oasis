import React from 'react'
import { Fab } from '@material-ui/core';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Text from '../text.json';

const texts = Text["Warning Signs"].texts
const listIndex = Text["Warning Signs"].listIndex
const linkIndex = Text["Warning Signs"].linkIndex

export default function Alert(props) {
    return (
        <div className="Alert">
            {/* <div className="dark mask"></div> */}
            <h1 className="title">WARNING</h1>
            <div className="warnings">
                {texts.map((x, i) => {
                    if (listIndex.indexOf(i) >= 0)
                        return <p key={i}>● {x}</p>
                    else if (linkIndex.indexOf(i) >= 0)
                        return <a key={i} href={x}>{x}</a>
                    else
                        return <p key={i}>{x}</p>
                })}
                <Fab style={{ background: "#9206FF" }} aria-label="add" onClick={()=>props.history.push("/onboard")} size="medium" className="fab back-btn">
                    <ArrowLeftIcon />
                </Fab>
                <Fab style={{ background: "#EA2027" }} aria-label="add" onClick={()=>props.history.push("/confirm")} size="medium" className="fab next-btn">
                    <ArrowRightIcon />
                </Fab>
            </div>
        </div >
    )
}
