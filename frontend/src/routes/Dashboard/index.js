import React from 'react';
import Link from '@material-ui/core/Link';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import { useSelector } from 'react-redux'
import classNames from 'classnames';
import styles from './styles.module.css';
import paths from 'routes/paths';
import PopUp from 'components/PopUp'

const status =
{
    positive: { name: 'Tested Positive', color: 'red' },
    sick: { name: 'Sick', color: 'orange' },
    negative: { name: 'Tested Negative', color: 'purple' },
    recovered: { name: 'Recovered', color: 'green' },
    "not sick": { name: 'Not Sick', color: 'gray' },
    "not tested": { name: 'Not Tested', color: 'blue' }
}

const actions = [
    { name: ' ADD MY STORY ', href: paths.myStory, classes: "MuiFab-extended" },
    { name: ' DAILY ASSESSMENT ', href: paths.feeling, classes: classNames("MuiFab-extended assessment", styles.assessment) },
];

function Dashboard(props) {
    const [open, setOpen] = React.useState(false);

    const isSick = useSelector(state => state.post.sick);
    const tested = useSelector(state => state.post.tested);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [data, setData] = React.useState({ confirmed: null, deaths: null, recovered: null });

    React.useEffect(() => {
        fetch("https://covid19api.herokuapp.com/latest")
            .then(res => res.json())
            .then(
                (result) => {
                    setData(result);
                },
                (error) => { }
            )
    }, [])

    let donate_link = null;

    if (isSick === "recovered" && tested === "positive") {
        donate_link = <Link href="https://med.stanford.edu/id/covid19/lambda.html" style={{ color: '#EB5757' }}>Donate your blood to help others</Link>
    }

    const preventDefault = (event) => event.preventDefault();

    return (
        <div className="Dashboard">
            <div className="row status-wrapper">
                <div className="col">
                    <div className="row">
                        <h3>MY STATUS</h3>
                    </div>

                    <div className="status-list">
                        <div className="row status-item">
                            <span className={styles.dot} style={{ background: status[isSick].color }}></span>
                            {status[isSick].name}
                        </div>
                        <div className="row status-item">
                            <span className={styles.dot} style={{ background: status[tested].color }}></span>
                            {status[tested].name}
                        </div>
                        <div >

                        </div>
                    </div>
                </div>
                <div className="col update-list" style={{ textAlign: 'right' }}>
                    <h3>LATEST UPDATE</h3>
                    <div>
                        <div>COVID-19 Cases: {data.confirmed}</div>
                        <div>Total Deaths: {data.deaths}</div>
                        <div>Total Recovered: {data.recovered}</div>
                    </div>
                </div>

            </div>
            <div className="row">
                <div className="col suggestions-wrapper">
                    <h3>SUGGESTIONS</h3>
                    {/* <div style={{ color: "gray" }}>Stay at home</div> */}
                    <PopUp
                        label={<span style={{ textDecoration: "underline", color: "white" }}>What to do</span>}
                        // title={<h2 style={{ textAlign: 'center' }}>Terms and Conditions</h2>}
                        texts={["N/A"]}
                        linkIndex={[0]}/>
                    <PopUp
                        label={<span style={{ textDecoration: "underline", color: "white" }}>Trials</span>}
                        // title={<h2 style={{ textAlign: 'center' }}>Terms and Conditions</h2>}
                        texts={["N/A"]}
                        linkIndex={[0]} />
                    <PopUp
                        label={<span style={{ textDecoration: "underline", color: "white" }}>Covid Info</span>}
                        // title={<h2 style={{ textAlign: 'center' }}>Terms and Conditions</h2>}
                        texts={["N/A"]}
                        linkIndex={[0]} />
                         <PopUp
                        label={<span style={{ textDecoration: "underline", color: "white" }}>Get Involved</span>}
                        // title={<h2 style={{ textAlign: 'center' }}>Terms and Conditions</h2>}
                        texts={["N/A"]}
                        linkIndex={[0]}/>

                </div>
                <div className="col">
                    <SpeedDial
                        ariaLabel="SpeedDial tooltip example"
                        className={classNames("speeddial", styles.speeddial)}
                        icon={<SpeedDialIcon />}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        open={open}
                    >
                        {actions.map((action) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.name}
                                tooltipTitle={action.name}
                                className={action.classes}
                                onClick={() => props.history.push(action.href)}
                            ></SpeedDialAction>
                        ))}
                    </SpeedDial>
                </div>
            </div>
        </div>
    );
}
export default Dashboard;
