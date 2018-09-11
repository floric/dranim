import React, { SFC } from 'react';

import { Workspace } from '@masterthesis/shared';
import { Icon, Menu } from 'antd';
import { NavLink } from 'react-router-dom';

const logo = require('../../../public/icons/logo_short.jpg');

import { MenuItemContent } from './MenuItemContent';

export const AppMenu: SFC<{
  collapsed: boolean;
  workspaces?: Array<Workspace>;
  datasets?: Array<{
    name: string;
    id: string;
  }>;
}> = ({ datasets, workspaces, collapsed }) => (
  <>
    <NavLink to="/">
      <img src={logo} width="100%" alt="dranim" />
    </NavLink>
    <Menu theme="dark" defaultSelectedKeys={['start']} mode="inline">
      <Menu.Item key="start">
        <MenuItemContent
          collapsed={collapsed}
          href="/"
          title="Start"
          iconName="home"
        />
      </Menu.Item>
      <Menu.SubMenu
        key="sub1"
        title={
          <span>
            <Icon type="database" />
            {!collapsed ? ' Data' : null}
          </span>
        }
      >
        <Menu.Item key="menu_datasets">
          <MenuItemContent
            collapsed={collapsed}
            href="/data"
            title="Datasets"
          />
        </Menu.Item>
        {datasets && datasets.length > 0 && <Menu.Divider />}
        {datasets &&
          datasets.map((ds: { name: string; id: string }) => (
            <Menu.Item key={`menu_passages+${ds.id}`}>
              <NavLink to={`/data/${ds.id}`}>{ds.name}</NavLink>
            </Menu.Item>
          ))}
      </Menu.SubMenu>
      <Menu.SubMenu
        key="sub2"
        title={
          <span>
            <Icon type="filter" />
            {!collapsed ? ' Explorer' : null}
          </span>
        }
      >
        <Menu.Item key="menu_workspaces">
          <MenuItemContent
            collapsed={collapsed}
            href="/workspaces"
            title="Workspaces"
          />
        </Menu.Item>
        {workspaces && workspaces.length > 0 && <Menu.Divider />}
        {workspaces &&
          workspaces.map((ws: { name: string; id: string }) => (
            <Menu.Item key={`menu_ws+${ws.id}`}>
              <NavLink to={`/workspaces/${ws.id}`}>{ws.name}</NavLink>
            </Menu.Item>
          ))}
      </Menu.SubMenu>
    </Menu>
  </>
);
