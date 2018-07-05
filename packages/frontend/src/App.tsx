import * as React from 'react';

import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { isLoggedIn } from './io/auth';
import { getAsyncPage } from './utils/async';

const RegistrationPage = getAsyncPage(() => import('./pages/RegistrationPage'));
const LoginPage = getAsyncPage(() => import('./pages/LoginPage'));
const LogoutPage = getAsyncPage(() => import('./pages/LogoutPage'));
const LoggedInApp = getAsyncPage(() => import('./LoggedInApp'));

export interface AppProps extends RouteComponentProps<{}, {}> {}

class App extends React.Component<AppProps> {
  public render() {
    const loggedIn = isLoggedIn();
    return (
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/logout" component={LogoutPage} />
        <Route exact path="/registration" component={RegistrationPage} />
        {loggedIn === true && <Route path="/" component={LoggedInApp} />}
        <Route path="/" render={() => <Redirect to="/login" />} />
      </Switch>
    );
  }
}

export default withRouter(App);
