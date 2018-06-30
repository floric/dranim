import * as React from 'react';

import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { isLoggedIn } from './io/auth';
import LoggedInApp from './LoggedInApp';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';

export interface AppProps extends RouteComponentProps<{}, {}> {}

class App extends React.Component<AppProps> {
  public render() {
    const loggedIn = isLoggedIn();
    return (
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/logout" component={LogoutPage} />
        <Route exact path="/register" component={RegisterPage} />
        {loggedIn === true && <Route path="/" component={LoggedInApp} />}
        <Route path="/" render={() => <Redirect to="/login" />} />
      </Switch>
    );
  }
}

export default withRouter(App);
