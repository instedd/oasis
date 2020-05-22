import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import history from '../../history';
import { signIn } from 'actions/auth';
import { ERROR } from 'actions/types';
import paths from 'routes/paths';
import AuthPaper from 'components/AuthPaper';

import styles from './styles.module.css';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn() {
  const dispatch = useDispatch();
  const classes = useStyles();
  
  const {status, user} = useSelector(state => state.auth);

  const [formValues, setFormValues] = useState({
    password: '',
    email: (user && user.email) || '',
  });
  
  const handleFormChange = (key) => (event) => {
    setFormValues({...formValues, [key]: event.target.value});
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(signIn(formValues))
  };
  
  return (
    <AuthPaper>
      <h1 className={styles.title}>Sign In</h1>
      {status.detail && (
        <p className={classNames(styles.status, status.type === ERROR && styles.error)}>
          {status.detail}
        </p>
      )}
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
          value={formValues.email}
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
          value={formValues.password}
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
    </AuthPaper>
  );
}
