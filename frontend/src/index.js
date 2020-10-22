import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import "css/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Link, Route, Router, Switch } from "react-router-dom";
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
import StoryHistory from "routes/StoryHistory";
import Symptoms from "routes/Symptoms";
import styles from "styles.module.css";
import history from "./history";
import store from "store/configureStore";
import * as serviceWorker from "./serviceWorker";
import Wrapper from "components/Wrapper";
import ReactGA from "react-ga";

const TRACKINGID = "UA-179246573-1"; // Replace with your Google Analytics tracking ID
ReactGA.initialize(TRACKINGID);

// Initialize google analytics page view tracking
history.listen((location) => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

ReactDOM.render(
  <Provider store={store}>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Router history={history}>
        <Link to={paths.home} className={styles.header}>
          OASIS
        </Link>
        <Wrapper draggableMapRoutes={[paths.dashboard]}>
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
            <Route path={paths.confirm} component={Confirm} />
            <Route
              path={paths.healthMeasurements}
              component={HealthMeasurements}
            />
            <Route path={paths.signUp} component={SignUp} />
            <Route path={paths.myStory} component={MyStory} />
            <Route path={paths.storyHistory} component={StoryHistory} />
            <Route path={paths.dashboard} component={Dashboard} />
          </Switch>
        </Wrapper>
      </Router>
    </MuiPickersUtilsProvider>
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();
