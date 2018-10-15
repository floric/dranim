import React, { SFC } from 'react';

import { Button } from 'antd';
import { History } from 'history';

import { CustomErrorCard } from '../../../components/layout/CustomCards';

export const UnknownWorkspaceCard: SFC<{ history: History }> = ({
  history
}) => (
  <CustomErrorCard
    title="Unknown Workspace"
    description="This Workspace doesn't exist or you are missing the permissions to view it."
    actions={
      <Button
        type="primary"
        icon="plus-square"
        onClick={() => history.push('/workspaces')}
      >
        Create Workspace
      </Button>
    }
  />
);
