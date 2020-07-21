import React from "react";
import styles from "./styles.module.css";

function Wrapper({ children }) {
  return (
    <main className={styles.root}>
      <div className={styles.content}>{children}</div>
    </main>
  );
}
export default Wrapper;
