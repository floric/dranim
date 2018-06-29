import * as React from 'react';

import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import LoggedInApp from './LoggedInApp';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export interface AppProps extends RouteComponentProps<{}, {}> {}

class App extends React.Component<AppProps> {
  public render() {
    if (true) {
      return (
        <Switch>
          <Route exact path="/" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
        </Switch>
      );
    }

    return (
      <Switch>
        <Route path="/" component={LoggedInApp} />
      </Switch>
    );
  }
}

export default withRouter(App);
