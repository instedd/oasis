import React from 'react';
import Popover from '@material-ui/core/Popover';

export default function Pop({label, title, texts, listIndex=[-1], linkIndex=[-1]}) {
  
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
    <>
      <div aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>{label}</div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={handleClose}
        // disableRestoreFocus
      >
        <div className="terms-wrapper" onClick={handleClose}>
          {title}
          
            {texts.map((x, i) => {
              if (listIndex.indexOf(i) >= 0)
                return <p key={i}>● {x}</p>
              else if (linkIndex.indexOf(i) >= 0)
                return <a key={i} href={x}>{x}</a>
              else
                return <p key={i}>{x}</p>
            })
          }
        </div>
      </Popover>
    </>
  );
}
