import React from "react";
import styles from "./styles.module.css";

function Wrapper({ children }) {
  return (
    <main className={styles.root}>
      <div className={styles.content}>{children}</div>
      <div
        className={styles.poweredBy}
        onClick={() => window.open("https://earth2.ucsd.edu/")}
      >
        <span>powered by</span>
        <img src="/static/earth2-logo.png" alt="EARTH2.0"></img>
      </div>
    </main>
  );
}
export default Wrapper;
