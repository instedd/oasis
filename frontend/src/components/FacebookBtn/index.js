import React from "react";
import { useDispatch } from "react-redux";
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
        textButton="SIGN IN WITH FACEBOOK"
        buttonStyle={{
          width: "100%",
          height: 36,
          borderRadius: 4,
          fontSize: 14,
          backgroundColor: "rgb(255, 255, 255)",
          fontWeight: 500,
          padding: 0,
          display: "flex",
          justifyContent: "center",
          lineHeight: "36px",
          color: "gray",
          border: "none",
        }}
        icon={
          <img
            alt="f"
            src="https://img.icons8.com/fluent/22/000000/facebook-new.png"
            style={{
              paddingRight: "5px",
              width: 22,
              height: 22,
              margin: "5px 0",
            }}
          />
        }
      />
    </div>
  );
}
