import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { GoogleLogin, GoogleLogout } from "react-google-login";

const CLIENT_ID =
  "194122770228-sf8dnv46cs5dsrqn8g29iksvico2urtb.apps.googleusercontent.com";

class GoogleBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogined: false,
      email: "",
      accessToken: "",
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);
  }

  login(response) {
    if (
      response.accessToken &&
      response.profileObj &&
      response.profileObj.email
    ) {
      this.setState((state) => ({
        isLogined: true,
        email: response.profileObj.email,
        accessToken: response.accessToken,
      }));
    }
  }

  logout(response) {
    this.setState((state) => ({
      isLogined: false,
      email: "",
      accessToken: "",
    }));
  }

  handleLoginFailure(response) {
    alert("Failed to log in");
  }

  handleLogoutFailure(response) {
    alert("Failed to log out");
  }

  render() {
    return (
      <div>
        {this.state.isLogined && this.state.email ? (
          <GoogleLogout
            style={{ width: 140 }}
            clientId={CLIENT_ID}
            buttonText={"LOGOUT " + this.state.email.toUpperCase()}
            onLogoutSuccess={this.logout}
            onFailure={this.handleLogoutFailure}
            render={(renderPropos) => (
              <Button
                style={{ background: "white", color: "gray" }}
                fullWidth
                variant="contained"
                onClick={renderPropos.onClick}
                disbale={renderPropos.disabled}
              >
                <img src="https://img.icons8.com/color/24/000000/google-logo.png" />{" "}
                Logout {this.state.email.toUpperCase()}
              </Button>
            )}
          ></GoogleLogout>
        ) : (
          <GoogleLogin
            clientId={CLIENT_ID}
            buttonText="LOGIN WITH GOOGLE"
            onSuccess={this.login}
            onFailure={this.handleLoginFailure}
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
                />{" "}
                SIGN IN WITH GOOGLE
              </Button>
            )}
          />
        )}
      </div>
    );
  }
}

export default GoogleBtn;
