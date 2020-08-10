import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import React from "react";

export default function Pop({ label, title, texts, listIndex, linkIndex }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        aria-owns="simple-popover"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {label}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        onClose={handleClose}
        aria-live="polite"
      >
        <div className="terms-wrapper" onClick={handleClose}>
          {title}
          <ul>
            {texts.map((x, i) => {
              if (listIndex.indexOf(i) >= 0) return <li key={i}>{x}</li>;
              else if (linkIndex.indexOf(i) >= 0)
                return (
                  <a key={i} href={x}>
                    {x}
                  </a>
                );
              else return <p key={i}>{x}</p>;
            })}
          </ul>
        </div>
      </Popover>
    </>
  );
}
