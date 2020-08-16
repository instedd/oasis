import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import FacebookLogin from "react-facebook-login";

const APP_ID = "725054974718611";

class FacebookBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogined: false,
      email: "",
      accessToken: "",
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
  }

  login(response) {
    console.log("here");
    console.log(response);
    if (response.accessToken && response.email) {
      this.setState((state) => ({
        isLogined: true,
        email: response.email,
        accessToken: response.accessToken,
      }));
    }
  }

  handleLoginFailure(response) {
    alert("Failed to log in");
  }

  render() {
    return (
      <div style={{ marginTop: "16px", marginBottom: "12px" }}>
        <FacebookLogin
          appId={APP_ID}
          fields="name,email,picture"
          callback={this.login}
          textButton=""
          buttonStyle={{ all: "unset" }}
          icon={
            <Button
              style={{ background: "white", color: "gray", width: "286px" }}
              variant="contained"
            >
              <img
                alt="f"
                src="https://img.icons8.com/fluent/22/000000/facebook-new.png"
                style={{ paddingRight: "5px" }}
              />{" "}
              SIGN IN WITH FACEBOOK
            </Button>
          }
        />
      </div>
    );
  }
}

export default FacebookBtn;
