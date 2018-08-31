import React, { Component, SFC } from 'react';

import { Tabs } from 'antd';
import { Route, RouteComponentProps, Switch } from 'react-router';

type Panes = Array<{
  name: string;
  key: string;
  content: JSX.Element;
}>;

export type RoutedTabsProps = {
  panes: Panes;
  defaultKey: string;
} & RouteComponentProps<{}>;

type RenderPropsProps = {
  panes: Panes;
} & RouteComponentProps<{ pageKey: string }>;

const RenderProps: SFC<RenderPropsProps> = props => {
  const {
    panes,
    match: {
      params: { pageKey }
    }
  } = props;

  const matchingPane = panes.find(n => n.key === pageKey) || null;
  if (matchingPane) {
    return matchingPane.content;
  }

  return <p>404</p>;
};

export class RoutedTabs extends Component<RoutedTabsProps> {
  public componentWillMount() {
    const { defaultKey, panes } = this.props;
    if (panes.find(n => n.key === defaultKey) === undefined) {
      throw new Error('Default key not defined in panes');
    }
  }

  private handleOnTabChange = (newKey: string) =>
    this.props.history.push(`${this.props.match.url}/${newKey}`);

  public render() {
    const {
      panes,
      location: { pathname },
      match: { path, url }
    } = this.props;
    const activeKey = pathname.substr(url.length + 1);
    return (
      <>
        <Tabs
          activeKey={activeKey}
          onChange={this.handleOnTabChange}
          type="card"
          animated={{ inkBar: true, tabPane: false }}
          tabBarStyle={{ marginBottom: 0 }}
        >
          {panes.map(({ key, name }) => (
            <Tabs.TabPane key={key} tab={name} />
          ))}
        </Tabs>
        <Switch>
          <Route
            path={`${path}/:pageKey`}
            render={props => <RenderProps {...this.props} {...props} />}
          />
        </Switch>
      </>
    );
  }
}
