import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import Copyright from 'components/Copyright';

import styles from './styles.module.css';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  container: {
    maxWidth: '350px',
    background: 'white',
    padding: '1rem 2rem',
  }
}));

export default function AuthPaper({children}) {
  const classes = useStyles();
  
  return (
    <div className={styles.root}>
      <Container className={classes.container} component="main" >
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          {children}
        </div>
        <Copyright />
      </Container>
    </div>
  );
}
