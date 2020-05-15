import React from 'react';
import '../css/App.css';
import { Checkbox } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Text from '../text.json';
import Pop from '../elements/Pop';
import Map from '../elements/Map';

const useStyles = makeStyles((theme) => ({
  speedDial: {
    '& .MuiFab-label': {
      width: 'max-content',
      padding: 2
    },
    width: 240
  },
  button: {
    '&:hover': {
      background: "#EA2027", color: "white"
    },
    background: "#EA2027", color: "white",
    size: "large"
  },
  terms: {
    background: "none",
    color: 'white',
    width: 'max-content',
    borderRadius: 0,
    boxShadow: 'none',
    '&:hover': {
      background: "none",
    },
  },

}))

const useStylesTooltip = makeStyles((theme) => ({
  tooltip: {
    display: 'none'
  }
}))

const actions = [
  { name: ' SIGN IN / SIGN UP ', href: '/signin' },
  { name: ' CONTINUE AS GUEST ', href: '/onboard' },
];

function App(props) {
  const classes = useStyles();
  const classesTooltip = useStylesTooltip();
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const popoverClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const popoverClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? 'simple-popover' : undefined;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const texts = Text["Terms and Conditions"].texts
  const listIndex = Text["Terms and Conditions"].listIndex
  const linkIndex = Text["Terms and Conditions"].linkIndex
// console.log(texts)
  return (
    <div className="App container">
      <h1 className="title"> FIGHT COVID-19 PUT YOUR STORY ON THE MAP</h1>
      <div>
        <SpeedDial
          ariaLabel="SpeedDial tooltip example"
          className={classes.speedDial}
          hidden={hidden}
          icon={<SpeedDialIcon />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          FabProps={{ className: classes.button }}
        >
          <SpeedDialAction
            key="terms"
            className={classes.terms}
            tooltipTitle="Terms and Conditions"
            icon={<div className="row" style={{ alignItems: 'center' }}>
              <Checkbox style={{ color: "white", "padding": "0 5px 0 0" }} />
              <Pop
                label={<a style={{ textDecoration: "underline", color: "white" }}>Terms and Conditions</a>}
                title={<h2 style={{ textAlign: 'center' }}>Terms and Conditions</h2>}
                texts={texts}
                linkIndex={linkIndex}
                listIndex={listIndex} />
            </div>}


            TooltipClasses={classesTooltip}>

          </SpeedDialAction>
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.name}
              display={{ background: action.color }}
              tooltipTitle={action.name}
              className={"MuiFab-extended"}
              TooltipClasses={classesTooltip}
              href={action.href}
            ></SpeedDialAction>
          ))}

          {/* <FormControlLabel control={<Checkbox name="checkedC" />} label= /> */}
        </SpeedDial>
        {/* <Button aria-describedby={popoverId} variant="contained" color="primary" onClick={popoverClick}>
          Open Popover
      </Button> */}

      </div>

      {/* <Fab style={{ background: "#EA2027" }} aria-label="add" href="/onboard" size="large" className="fab">
        <AddIcon />
      </Fab> */}
    </div>
  );
}

export default App;
