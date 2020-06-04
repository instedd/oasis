import React, { useEffect, useState } from "react";

import Map from "components/Map";

import styles from "./styles.module.css";
import { useLocation } from "react-router-dom";

function Wrapper({ children, draggableMapRoutes = [] }) {
  let location = useLocation();

  const [draggableMap, setDraggableMap] = useState(false);

  useEffect(() => {
    let shouldDragMap = draggableMapRoutes.includes(location.pathname);
    if (shouldDragMap !== draggableMap)
      setDraggableMap(draggableMapRoutes.includes(location.pathname));
  }, location);

  return (
    <main className={styles.root}>
      <Map draggable={draggableMap} />
      <div className={styles.content}>{children}</div>
    </main>
  );
}

export default Wrapper;
