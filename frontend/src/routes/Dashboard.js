import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import EditIcon from '@material-ui/icons/Edit';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import { useSelector } from 'react-redux'


const useStyles = makeStyles((theme) => ({
    speedDial: {
        '& .MuiFab-label': {
            width: 'max-content'
        },
        position:"absolute",
        bottom:85,
        right: 15
    },
    button: {
        '&:hover': {
            background: "#EA2027", color: "white"
        },
        background: "#EA2027", color: "white",
        position:"absolute",
        bottom:-45,
        right: 5
    },
    label: {
        width: 'max-content'
    },
    editicon: {
        fontSize: "large",
        marginLeft: '10px',
    }
}));

const useStylesTooltip = makeStyles((theme) => ({
    tooltip: {
        display: 'none'
    }
}))

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
    { name: ' ADD MY STORY ', href: '', classes: "signin-btn MuiFab-extended" },
    { name: ' DAILY ASSESSMENT ', href: '/symptoms', classes: "MuiFab-extended" },
];

function Dashboard(props) {
    const classes = useStyles();
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
                (error) => {}
            )
    }, [])

    let donate_link = null;

    if (isSick === "recovered" && tested === "positive") {
        donate_link = <Link href="https://med.stanford.edu/id/covid19/lambda.html" style={{ color: '#EB5757' }}>Donate your blood to help others</Link>
    }

    const preventDefault = (event) => event.preventDefault();

    const classesTooltip = useStylesTooltip();


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
            <div className="row">
                <div className="col suggestions-wrapper">
                    <h3>SUGGESTIONS</h3>
                    <div style={{ color: "gray" }}>Stay at home</div>
                    <Link href="https://earth2-covid.ucsd.edu/homebound" style={{ color: '#2D9CDB' }}>Download HomeBound</Link>
                    <Link href="#" onClick={preventDefault} style={{ color: '#F2C94C' }}>Join a clinical trial</Link>
                    {donate_link}
                    <Link onClick={preventDefault} style={{ color: '#FFFFFF' }}>Learn more about COVID-19</Link>
                </div>
                <div className="col">
                    <SpeedDial
                        ariaLabel="SpeedDial tooltip example"
                        className={classes.speedDial}
                        icon={<SpeedDialIcon />}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        open={open}
                        FabProps={{ className: classes.button }}
                    >
                        {actions.map((action) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.name}
                                tooltipTitle={action.name}
                                className={action.classes}
                                TooltipClasses={classesTooltip}
                                href={action.href}
                            ></SpeedDialAction>
                        ))}
                    </SpeedDial>
                </div>
            </div>
        </div>
    );
}
export default Dashboard;