import React from 'react';
import Popover from '@material-ui/core/Popover';

export default function Pop(props) {
  
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  
  return (
    <div>
      <div aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>{props.label}</div>
      {/* <ErrorOutlineIcon  aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}></ErrorOutlineIcon> */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        onClose={handleClose}
        // disableRestoreFocus
      >
        <div className="terms-wrapper" onClick={handleClose}>
          {props.title}
          
            {props.texts.map((x, i) => {
              if (props.listIndex.indexOf(i) >= 0)
                return <p key={i}>● {x}</p>
              else if (props.linkIndex.indexOf(i) >= 0)
                return <a key={i} href={x}>{x}</a>
              else
                return <p key={i}>{x}</p>
            })
          }
        </div>
      </Popover>
    </div>
  );
}