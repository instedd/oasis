import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Button from "@material-ui/core/Button";

import { signIn } from "actions/auth";

const CLIENT_ID =
  "194122770228-sf8dnv46cs5dsrqn8g29iksvico2urtb.apps.googleusercontent.com";

export default function GoogleBtn() {
  const [loggedIn, setLoggedIn] = useState(false);
  const dispatch = useDispatch();

  const onLoginSuccess = (response) => {
    if (
      response.accessToken &&
      response.profileObj &&
      response.profileObj.email
    ) {
      const dto = {
        email: response.profileObj.email,
        password: response.accessToken,
      };
      dispatch(signIn(dto, true));
    }
  };

  const onLogoutSuccess = (response) => {
    setLoggedIn(false);
  };

  const onLoginFailure = (response) => {
    console.log("Failed to log in");
  };

  const onLogoutFailure = (response) => {
    console.log("Failed to log out");
  };

  return (
    <div>
      {loggedIn ? (
        <GoogleLogout
          style={{ width: 140 }}
          clientId={CLIENT_ID}
          buttonText={"LOGOUT"}
          onLogoutSuccess={onLogoutSuccess}
          onFailure={onLogoutFailure}
          render={(renderPropos) => (
            <Button
              style={{ background: "white", color: "gray" }}
              fullWidth
              variant="contained"
              onClick={renderPropos.onClick}
              disbale={renderPropos.disabled}
            >
              <img
                alt="g"
                src="https://img.icons8.com/color/24/000000/google-logo.png"
              />
              Logout
            </Button>
          )}
        />
      ) : (
        <GoogleLogin
          clientId={CLIENT_ID}
          buttonText="LOGIN WITH GOOGLE"
          onSuccess={onLoginSuccess}
          onFailure={onLoginFailure}
          cookiePolicy={"single_host_origin"}
          responseType="code,token"
          render={(renderPropos) => (
            <Button
              style={{ background: "white", color: "gray" }}
              fullWidth
              variant="contained"
              onClick={renderPropos.onClick}
              disbale={renderPropos.disabled}
            >
              <img
                alt="g"
                src="https://img.icons8.com/color/20/000000/google-logo.png"
                style={{ paddingRight: "5px" }}
              />
              SIGN IN WITH GOOGLE
            </Button>
          )}
        />
      )}
    </div>
  );
}
