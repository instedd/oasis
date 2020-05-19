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

import App from './routes/App';
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

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>


        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router>
            <Link to="/" className="header">OASIS</Link>
            {/* <Link className="sign-in-btn" to="/signin"><span>SIGN IN</span></Link> */}
            <Map></Map>
            <Switch>
              <Route exact path="/" component={App} />
              <Route path="/signin" component={SignIn} />
              <Route path="/onboard" component={Onboard} />
              <Route path="/alert" component={Alert} />
              <Route path="/questions" component={CriticalQuestions} />
              <Route path="/symptoms" component={Symptoms} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/confirm" component={Confirm} />
              <Route path="/measurements" component={HealthMeasurements} />
              <Route path="/signup" component={SignUp} />
              <Route path="/mystory" component={MyStory} />

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
