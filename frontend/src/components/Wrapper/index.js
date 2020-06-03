import React from "react";

import Map from "components/Map";

import styles from "./styles.module.css";

function Wrapper({ children, draggableMap = false }) {
  return (
    <div className={styles.root}>
      <Map draggable={draggableMap} />
      {children}
    </div>
  );
}

export default Wrapper;
