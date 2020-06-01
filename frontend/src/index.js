import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import Map from "components/Map";
import "css/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Link, Route, Router, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import Alert from "routes/Alert";
import Confirm from "routes/Confirm";
import CriticalQuestions from "routes/CriticalQuestions";
import Dashboard from "routes/Dashboard";
import HealthMeasurements from "routes/HealthMeasurements";
import Home from "routes/Home";
import MyStory from "routes/MyStory";
import Onboard from "routes/Onboard";
import paths from "routes/paths";
import SignIn from "routes/SignIn";
import SignUp from "routes/SignUp";
import Symptoms from "routes/Symptoms";
import styles from "styles.module.css";
import history from "./history";
import { persistor, store } from "./redux";
import * as serviceWorker from "./serviceWorker";

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
