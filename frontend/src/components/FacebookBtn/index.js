import React from "react";
import { useDispatch } from "react-redux";
import Button from "@material-ui/core/Button";
import FacebookLogin from "react-facebook-login";

import { signIn } from "../../actions/auth";

const APP_ID = "725054974718611";

export default function FacebookBtn() {
  const dispatch = useDispatch();

  const onLoginSuccess = (response) => {
    if (response.accessToken && response.email) {
      const dto = {
        email: response.email,
        password: response.accessToken,
      };

      dispatch(signIn(dto, true));
    }
  };

  return (
    <div style={{ marginTop: "16px", marginBottom: "12px" }}>
      <FacebookLogin
        appId={APP_ID}
        fields="name,email,picture"
        callback={onLoginSuccess}
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
            />
            SIGN IN WITH FACEBOOK
          </Button>
        }
      />
    </div>
  );
}
