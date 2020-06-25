import React from "react";

import { withStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

const customStyles = (_theme) => ({
  icon: {
    color: "white",
  },
});

const Select = (props) => {
  const { classes, SelectProps, ...other } = props;
  return (
    <TextField
      select
      SelectProps={{
        classes: {
          icon: classes.icon,
        },
        displayEmpty: true,
        ...SelectProps,
      }}
      {...other}
    ></TextField>
  );
};

export default withStyles(customStyles)(Select);
