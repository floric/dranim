import React, { SFC } from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';

import { isLoggedIn } from './io/auth';
import { getAsyncPage } from './utils/async';

const RegistrationPage = getAsyncPage(() => import('./pages/RegistrationPage'));
const LoginPage = getAsyncPage(() => import('./pages/LoginPage'));
const LogoutPage = getAsyncPage(() => import('./pages/LogoutPage'));
const LoggedInApp = getAsyncPage(() => import('./LoggedInApp'));
const ResultsPage = getAsyncPage(() =>
  import('./pages/workspaces/ResultsPage')
);

export interface AppProps extends RouteComponentProps<{}, {}> {}

const App: SFC<AppProps> = () => {
  const loggedIn = isLoggedIn();
  return (
    <Switch>
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/logout" component={LogoutPage} />
      <Route exact path="/registration" component={RegistrationPage} />
      <Route path="/results/:workspaceId" component={ResultsPage} />
      {loggedIn && <Route path="/" component={LoggedInApp} />}
      <Route path="/" render={() => <Redirect to="/login" />} />
    </Switch>
  );
};

export default withRouter(App);
