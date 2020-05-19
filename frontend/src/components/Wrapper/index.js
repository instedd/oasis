import React from 'react';
import styles from './styles.module.css';


function Wrapper({children}) {
  return <main className={styles.root}>
    {children}
  </main>;
}

export default Wrapper;