import * as React from 'react';
import { SFC } from 'react';

import { Icon } from 'antd';
import { NavLink } from 'react-router-dom';

export const MenuItemContent: SFC<{
  collapsed: boolean;
  href: string;
  iconName?: string;
  title: string;
}> = ({ href, iconName, title, collapsed }) => (
  <>
    <NavLink to={href}>
      {iconName && <Icon type={iconName} />}
      {!collapsed ? ` ${title}` : null}
    </NavLink>
    {collapsed ? <span>{title}</span> : null}
  </>
);
