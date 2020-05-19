import React from 'react';
import classNames from 'classnames';
import { Checkbox } from '@material-ui/core';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import { makeStyles } from '@material-ui/core/styles';

import Wrapper from 'components/Wrapper';

import styles from './styles.module.css';
import Text from '../../text.json';
import Pop from '../../elements/Pop';

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
  fab: { backgroundColor: "red" }

}))

const useStylesTooltip = makeStyles((theme) => ({
  tooltip: {
    display: 'none'
  }
}))

const actions = [
  { name: ' SIGN IN / SIGN UP ', href: '/signin', classes: classNames(styles.signin, "MuiFab-extended") },
  { name: ' CONTINUE AS GUEST ', href: '/onboard', classes: "MuiFab-extended" },
];

function App(props) {
  const classes = useStyles();
  const classesTooltip = useStylesTooltip();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const texts = Text["Terms and Conditions"].texts
  const listIndex = Text["Terms and Conditions"].listIndex
  const linkIndex = Text["Terms and Conditions"].linkIndex
  return (
    <Wrapper>
      <h1 className={styles.title}> FIGHT COVID-19 PUT YOUR STORY ON THE MAP</h1>
      <div>
        <SpeedDial
          ariaLabel="SpeedDial tooltip example"
          className={classes.speedDial}
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
                label={<span style={{ textDecoration: "underline", color: "white" }}>Terms and Conditions</span>}
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
              tooltipTitle={action.name}
              className={action.classes}
              TooltipClasses={classesTooltip}
              href={action.href}
            ></SpeedDialAction>
          ))}
        </SpeedDial>
      </div>
    </Wrapper>
  );
}

export default App;
