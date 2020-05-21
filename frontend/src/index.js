import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
} from "react-router-dom";
import { Provider } from 'react-redux'
import {store, persistor} from './redux'
import 'css/index.css';

import Home from './routes/Home';
import SignIn from './routes/SignIn';
import Onboard from './routes/Onboard';
import Alert from './routes/Alert';
import CriticalQuestions from './routes/CriticalQuestions';
import * as serviceWorker from './serviceWorker';
import Symptoms from './routes/Symptoms';
import Confirm from './routes/Confirm';
import Map from './elements/Map'

import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import MomentUtils from '@date-io/moment';
import Dashboard from './routes/Dashboard';
import HealthMeasurements from './routes/HealthMeasurements';
import SignUp from './routes/SignUp';
import MyStory from './routes/MyStory';

import { PersistGate } from 'redux-persist/integration/react'
import history from './history';
import paths from 'routes/paths';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router>
            <Link to="/" className="header">OASIS</Link>
            <Map></Map>
            <Switch>
              <Route exact path={paths.home} component={Home} />
              <Route path={paths.signIn} component={SignIn} />
              <Route path={paths.onboard} component={Onboard} />
              <Route path={paths.alert} component={Alert} />
              <Route path={paths.criticalQuestions} component={CriticalQuestions} />
              <Route path={paths.symptoms} component={Symptoms} />
              <Route path={paths.dashboard} component={Dashboard} />
              <Route path={paths.confirm} component={Confirm} />
              <Route path={paths.healthMeasurements} component={HealthMeasurements} />
              <Route path={paths.signUp} component={SignUp} />
              <Route path={paths} component={MyStory} />

            </Switch>

          </Router>
        </MuiPickersUtilsProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
