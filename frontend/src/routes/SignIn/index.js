import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import history from '../../history';
import {signIn} from 'actions/auth';
import Copyright from 'components/Copyright';
import paths from 'routes/paths';

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
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  container: {
    maxWidth: '350px',
    background: 'white',
    padding: '0 2rem 2rem 2rem',
  }
}));


export default function SignIn() {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [formValues, setFormValues] = useState({
    password: '',
    email: '',
  });
  
  const handleFormChange = (key) => (event) => {
    setFormValues({...formValues, [key]: event.target.value});
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(signIn(formValues))
  };

  return (
    <div className={styles.root}>
      <Container className={classes.container} component="main" >
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <h1 className={styles.title}>Sign In</h1>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleFormChange('email')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleFormChange('password')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSubmit}
            >
              Sign In
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link onClick={() => history.push(paths.signUp)} variant="body2">
                  Don't have an account? Sign up
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Copyright />
      </Container>
    </div>
  );
}
