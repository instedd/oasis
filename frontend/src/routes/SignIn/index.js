import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

import history from "../../history";
import { signIn } from "actions/auth";
import { ERROR } from "actions/types";
import paths from "routes/paths";
import FacebookBtn from "components/FacebookBtn";
import GoogleBtn from "components/GoogleBtn";

import styles from "./styles.module.css";

const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn(props) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const { status, user } = useSelector((state) => state.auth);

  const [formValues, setFormValues] = useState({
    password: "",
    email: (user && user.email) || "",
  });

  const validateEmail = (email) => {
    // eslint-disable-next-line
    const validEmailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return validEmailFormat.test(email);
  };

  const handleFormChange = (key) => (event) => {
    setFormValues({ ...formValues, [key]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.email || formValues.email === "") {
      document.getElementById("incomplete_error").innerText =
        "Please enter your email address";
    } else if (!formValues.password || formValues.password === "") {
      document.getElementById("incomplete_error").innerText =
        "Please enter your password";
    } else if (!validateEmail(formValues.email)) {
      document.getElementById("incomplete_error").innerText = "";
    } else {
      dispatch(signIn(formValues));
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Sign In</h1>
      {status && status.detail && (
        <p
          className={classNames(
            styles.status,
            status.type === ERROR && styles.error
          )}
        >
          {status.detail}
        </p>
      )}
      <p id="incomplete_error" style={{ color: "red" }}></p>
      <form className={classes.form} noValidate>
        <TextField
          error={
            formValues.email.length > 0 && !validateEmail(formValues.email)
          }
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
          onChange={handleFormChange("email")}
          helperText={
            formValues.email.length > 0 && !validateEmail(formValues.email)
              ? "Please enter a valid email."
              : null
          }
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
          onChange={handleFormChange("password")}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          Sign In With Email
        </Button>
        <GoogleBtn />
        <FacebookBtn />
        <Grid container justify="flex-end">
          <Grid item>
            <Link onClick={() => history.push(paths.signUp)} variant="body2">
              Don't have an account? Sign up
            </Link>
          </Grid>
        </Grid>
        <Button
          className={styles.skipBtn}
          onClick={() =>
            props.history.push(paths.dashboard, { onboard: false })
          }
        >
          continue as guest
        </Button>
      </form>
    </div>
  );
}
