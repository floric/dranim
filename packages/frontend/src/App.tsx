import React, { SFC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';

import { getAsyncPage } from './utils/async';
import { ErrorBoundary } from './utils/ErrorBoundary';

const RegistrationPage = getAsyncPage(() => import('./pages/RegistrationPage'));
const LoginPage = getAsyncPage(() => import('./pages/LoginPage'));
const LogoutPage = getAsyncPage(() => import('./pages/LogoutPage'));
const LoggedInApp = getAsyncPage(() => import('./LoggedInApp'));
const ResultsPage = getAsyncPage(() =>
  import('./pages/workspaces/ResultsPage')
);

export interface AppProps extends RouteComponentProps<{}, {}> {}

const App: SFC<AppProps> = () => {
  return (
    <ErrorBoundary>
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/logout" component={LogoutPage} />
        <Route exact path="/registration" component={RegistrationPage} />
        <Route path="/results/:workspaceId" component={ResultsPage} />
        <Route path="/" component={LoggedInApp} />
      </Switch>
    </ErrorBoundary>
  );
};

export default withRouter(App);
