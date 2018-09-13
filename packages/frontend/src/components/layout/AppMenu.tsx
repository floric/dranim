import React, { SFC } from 'react';

import { Workspace } from '@masterthesis/shared';
import { Icon, Menu } from 'antd';
import { NavLink } from 'react-router-dom';

const logo = require('../../../public/icons/logo_short.jpg');

import { MenuItemContent } from './MenuItemContent';

const getMenuKeys = (path: string): string => {
  const segments = path.split('/').filter(n => n.length > 0);
  if (segments.length === 0) {
    return 'start';
  }

  return segments.slice(0, 2).join('-');
};

export type AppMenuProps = {
  pathname: string;
  collapsed: boolean;
  workspaces?: Array<Workspace>;
  datasets?: Array<{
    name: string;
    id: string;
  }>;
};

export const AppMenu: SFC<AppMenuProps> = ({
  datasets,
  workspaces,
  collapsed,
  pathname
}) => (
  <>
    <NavLink to="/">
      <img src={logo} width="100%" alt="dranim" />
    </NavLink>
    <Menu
      theme="dark"
      defaultSelectedKeys={[getMenuKeys(pathname)]}
      mode="inline"
    >
      <Menu.Item key="start">
        <MenuItemContent
          collapsed={collapsed}
          href="/"
          title="Start"
          iconName="home"
        />
      </Menu.Item>
      <Menu.SubMenu
        key="data-start"
        title={
          <span>
            <Icon type="database" />
            {!collapsed ? ' Data' : null}
          </span>
        }
      >
        <Menu.Item key="data">
          <MenuItemContent
            collapsed={collapsed}
            href="/data"
            title="Datasets"
          />
        </Menu.Item>
        {datasets && datasets.length > 0 && <Menu.Divider />}
        {datasets &&
          datasets.map((ds: { name: string; id: string }) => (
            <Menu.Item key={`data-${ds.id}`}>
              <NavLink to={`/data/${ds.id}`}>{ds.name}</NavLink>
            </Menu.Item>
          ))}
      </Menu.SubMenu>
      <Menu.SubMenu
        key="workspaces-start"
        title={
          <span>
            <Icon type="filter" />
            {!collapsed ? ' Explorer' : null}
          </span>
        }
      >
        <Menu.Item key="workspaces">
          <MenuItemContent
            collapsed={collapsed}
            href="/workspaces"
            title="Workspaces"
          />
        </Menu.Item>
        {workspaces && workspaces.length > 0 && <Menu.Divider />}
        {workspaces &&
          workspaces.map((ws: { name: string; id: string }) => (
            <Menu.Item key={`workspaces-${ws.id}`}>
              <NavLink to={`/workspaces/${ws.id}`}>{ws.name}</NavLink>
            </Menu.Item>
          ))}
      </Menu.SubMenu>
    </Menu>
  </>
);
