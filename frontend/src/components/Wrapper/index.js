import React from 'react';
import styles from './styles.module.css';


function Wrapper({children}) {
  return <div className={styles.root}>
    {children}
  </div>;
}

export default Wrapper;
