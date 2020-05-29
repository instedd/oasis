import React from "react";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import history from "../../history";
import paths from "routes/paths";

export default function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link
        color="inherit"
        onClick={() => {
          history.push(paths.home);
        }}
      >
        OASIS
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
