import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import EditIcon from '@material-ui/icons/Edit';
import { useDispatch, useSelector } from 'react-redux'

import Text from '../text.json';

const useStyles = makeStyles((theme) => ({
    speedDial: {
        '& .MuiFab-label': {
            width: 'max-content'
        }
    },
    button: {
        '&:hover': {
            background: "#EA2027", color: "white"
        },
        background: "#EA2027", color: "white"
    },
    label: {
        width: 'max-content'
    },
    editicon: {
        fontSize: "large",
        marginLeft: '10px',
    }
}));

const status =
{
    positive: { name: 'Tested Positive', color: 'red' },
    sick: { name: 'Sick', color: 'orange' },
    negative: { name: 'Tested Negative', color: 'purple' },
    recovered: { name: 'Recovered', color: 'green' },
    "not sick": { name: 'Not Sick', color: 'gray' },
    "not tested": { name: 'Not Tested', color: 'blue' }
}

function Dashboard(props) {

    const dispatch = useDispatch()

    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [hidden, setHidden] = React.useState(false);

    const isSick = useSelector(state => state.post.sick);
    const tested = useSelector(state => state.post.tested);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [data, setData] = React.useState({ confirmed: null, deaths: null, recovered: null });

    React.useEffect(() => {
        fetch("https://covid19api.herokuapp.com/latest")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setData(result);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    let donate_link = null;
    let trial_link = null;
    if (localStorage.isSick === "recovered" && localStorage.tested === "positive") {
        donate_link = <Link href="https://med.stanford.edu/id/covid19/lambda.html" style={{ color: '#EB5757' }}>Donate your blood to help others</Link>
    }
    else {
        donate_link = null;
    }

    const preventDefault = (event) => event.preventDefault();
    // const data= useSelector(state => state.get.overall);
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
                        <Link className="row status-item" style={{ color: 'white' }} onClick={() => props.history.push("/onboard")}>
                            <EditIcon className={classes.editicon} />
                        </Link>
                    </div>

                    <div className="status-list">
                        <div className="row status-item">
                            <span className="dot" style={{ background: status[isSick].color }}></span>
                            {status[isSick].name}
                        </div>
                        <div className="row status-item">
                            <span className="dot" style={{ background: status[tested].color }}></span>
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

            <div className="col suggestions-wrapper">
                <h3>SUGGESTIONS</h3>
                <div style={{ color: "gray" }}>Stay at home</div>
                <Link href="https://earth2-covid.ucsd.edu/homebound" style={{ color: '#2D9CDB' }}>Download HomeBound</Link>
                <Link href="#" onClick={preventDefault} style={{ color: '#F2C94C' }}>Join a clinical trial</Link>
                {donate_link}
                <Link onClick={preventDefault} style={{ color: '#FFFFFF' }}>Learn more about COVID-19</Link>
            </div>
        </div>
    );
}
export default Dashboard;