import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import paths from 'routes/paths';
import { sicknessStatus, testStatus } from 'routes/types';
import styles from './styles.module.css';

const status =
{
    [testStatus.POSITIVE]: { name: 'Tested Positive', color: 'red' },
    [testStatus.NEGATIVE]: { name: 'Tested Negative', color: 'purple' },
    [testStatus.NOT_TESTED]: { name: 'Not Tested', color: 'blue' },
    [sicknessStatus.SICK]: { name: 'Sick', color: 'orange' },
    [sicknessStatus.RECOVERED]: { name: 'Recovered', color: 'green' },
    [sicknessStatus.NOT_SICK]: { name: 'Not Sick', color: 'gray' }
}

const actions = [
    { name: ' ADD MY STORY ', href: paths.myStory, classes: "MuiFab-extended" },
    { name: ' DAILY ASSESSMENT ', href: paths.symptoms, classes: classNames("MuiFab-extended assessment", styles.assessment) },
];

function Dashboard(props) {
    const [open, setOpen] = React.useState(false);

    const isSick = useSelector(state => state.post.sick);
    const tested = useSelector(state => state.post.tested);
    const story = useSelector(state => state.post.story);

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
                (error) => {}
            )
    }, [])

    let donate_link = null;

    if (isSick === sicknessStatus.RECOVERED && tested === testStatus.POSITIVE) {
        donate_link = <Link href="https://med.stanford.edu/id/covid19/lambda.html" style={{ color: '#EB5757' }}>Donate your blood to help others</Link>
    }

    const preventDefault = (event) => event.preventDefault();

    return (
        <div className="Dashboard">
            <Breadcrumbs aria-label="breadcrumb" className="breadcrumbs">
                <Link color="inherit">myTrials</Link>
                <Link color="inherit">myDonations</Link>
                <Link color="inherit">myRecords</Link>
            </Breadcrumbs>
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
                    <div style={{ color: "gray" }}>Stay at home</div>
                    <Link href="https://earth2-covid.ucsd.edu/homebound" style={{ color: '#2D9CDB' }}>Download HomeBound</Link>
                    {story && story.location == "Mexico" && story.citizenship == "United States of America" && (
                        <Link href="https://mx.usembassy.gov/u-s-citizen-services/covid-19-information/" style={{ color: '#FFFFFF' }} target="_blank">Information for US Citizens</Link>
                    )}
                    <Link href="#" onClick={preventDefault} style={{ color: '#F2C94C' }}>Join a clinical trial</Link>
                    {donate_link}
                    <Link onClick={preventDefault} style={{ color: '#FFFFFF' }}>Learn more about COVID-19</Link>
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
                                onClick={()=>props.history.push(action.href)}
                            ></SpeedDialAction>
                        ))}
                    </SpeedDial>
                </div>
            </div>
        </div>
    );
}
export default Dashboard;
