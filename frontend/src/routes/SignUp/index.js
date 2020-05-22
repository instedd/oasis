import React from 'react';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import {signUp} from 'actions/auth';
import { ERROR } from 'actions/types';
import styles from './styles.module.css'
import paths from 'routes/paths';
import AuthPaper from 'components/AuthPaper';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formValues, setFormValues] = useState({
    password: '',
    email: '',
    firstName: '',
    username: '',
  });
  
  const handleFormChange = (key) => (event) => {
    setFormValues({...formValues, [key]: event.target.value});
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(signUp(formValues))
  };
  
  const status = useSelector(state => state.auth.status);

  return (
    <AuthPaper>
      <h1 className={styles.title}>Sign Up</h1>
      {status.detail && (
        <p className={classNames(styles.status, status.type === ERROR && styles.error)}>
          {status.detail}
        </p>
      )}
      <form className={classes.form} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoComplete="fname"
              name="firstName"
              variant="outlined"
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoFocus
              onChange={handleFormChange('firstName')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              onChange={handleFormChange('username')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              onChange={handleFormChange('email')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleFormChange('password')}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          Sign Up
        </Button>
        <Grid container justify="flex-end">
          <Grid item>
            <Link onClick={()=>props.history.push(paths.signIn)} variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthPaper>
  );
}
