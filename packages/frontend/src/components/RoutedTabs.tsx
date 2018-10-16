import React, { Component, SFC } from 'react';

import { Tabs } from 'antd';
import { Route, RouteComponentProps, Switch } from 'react-router';

import { CustomErrorCard } from './layout/CustomCards';

type Panes = Array<{
  name: string;
  key: string;
  content: JSX.Element;
  disabled?: boolean;
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

  return (
    <CustomErrorCard
      title="Page not found"
      description="This tab doesn't exist. Please choose another one."
    />
  );
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
      defaultKey,
      panes,
      location: { pathname },
      match: { path, url, isExact }
    } = this.props;
    const activeKey = isExact ? defaultKey : pathname.substr(url.length + 1);
    return (
      <>
        <Tabs
          activeKey={activeKey}
          onChange={this.handleOnTabChange}
          type="card"
          animated={{ inkBar: true, tabPane: false }}
          tabBarStyle={{ marginBottom: 0 }}
        >
          {panes.map(({ key, name, disabled = false }) => (
            <Tabs.TabPane key={key} tab={name} disabled={disabled} />
          ))}
        </Tabs>
        <Switch>
          <Route
            path={`${path}/:pageKey`}
            render={props => <RenderProps {...this.props} {...props} />}
          />
          {isExact ? panes[0].content : null}
        </Switch>
      </>
    );
  }
}
