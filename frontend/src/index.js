import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch, Link } from "react-router-dom";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./redux";
import "css/index.css";

import Home from "routes/Home";
import SignIn from "routes/SignIn";
import Onboard from "routes/Onboard";
import Alert from "routes/Alert";
import CriticalQuestions from "routes/CriticalQuestions";
import Symptoms from "routes/Symptoms";
import Confirm from "routes/Confirm";
import Dashboard from "routes/Dashboard";
import HealthMeasurements from "routes/HealthMeasurements";
import SignUp from "routes/SignUp";
import MyStory from "routes/MyStory";
import Feeling from 'routes/Feeling';
import paths from "routes/paths";

import Map from "components/Map";
import * as serviceWorker from "./serviceWorker";

import history from "./history";
import styles from "styles.module.css";


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router history={history}>
            <Link to={paths.home} className={styles.header}>
              OASIS
            </Link>
            <Map></Map>
            <main className={styles.root}>
              <Switch>
                <Route exact path={paths.home} component={Home} />
                <Route path={paths.signIn} component={SignIn} />
                <Route path={paths.onboard} component={Onboard} />
                <Route path={paths.alert} component={Alert} />
                <Route
                  path={paths.criticalQuestions}
                  component={CriticalQuestions}
                />
                <Route path={paths.symptoms} component={Symptoms} />
                <Route path={paths.dashboard} component={Dashboard} />
                <Route path={paths.confirm} component={Confirm} />
                <Route
                  path={paths.healthMeasurements}
                  component={HealthMeasurements}
                />
                <Route path={paths.signUp} component={SignUp} />
                <Route path={paths.myStory} component={MyStory} />
                <Route path={paths.feeling} component={Feeling} />
              </Switch>
            </main>
          </Router>
        </MuiPickersUtilsProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorker.unregister();
