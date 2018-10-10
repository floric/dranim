import React, { Component } from 'react';

import { GQLOutputResult, OutputResult } from '@masterthesis/shared';
import { Button, Card, Divider, Dropdown, Icon, Menu } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { tryOperation } from '../../utils/form';
import { AsyncButton } from '../AsyncButton';

type DownloadOptions = Array<{
  name: string;
  icon: string;
  onClick: () => void | Promise<void>;
}>;

export type VisCardProps = {
  result: GQLOutputResult;
  downloadOptions?: DownloadOptions;
  properties?: JSX.Element;
};

export interface VisCardState {
  showProperties: boolean;
}

const generateDownloadMenu = (options: DownloadOptions) => (
  <Menu
    onClick={({ key }) => {
      options.forEach(o => {
        if (o.name === key) {
          o.onClick();
          return;
        }
      });
    }}
  >
    {options.map(o => (
      <Menu.Item key={o.name}>
        <Icon type={o.icon} />
        {o.name}
      </Menu.Item>
    ))}
  </Menu>
);

const SET_RESULT_VISIBILITY = gql`
  mutation setResultVisibility($id: ID!, $visible: Boolean!) {
    setResultVisibility(id: $id, visible: $visible) {
      visible
    }
  }
`;

export class VisCard extends Component<VisCardProps, VisCardState> {
  public state: VisCardState = {
    showProperties: false
  };

  private toggleProperties = () =>
    this.setState({ showProperties: !this.state.showProperties });

  public render() {
    const {
      result: { name, description, visible, id, workspaceId },
      children,
      downloadOptions,
      properties
    } = this.props;
    const { showProperties } = this.state;

    return (
      <Card
        title={name}
        bordered={false}
        style={{ marginBottom: '1rem' }}
        extra={
          <Button.Group size="small">
            {properties && (
              <Button
                icon={showProperties ? 'up' : 'down'}
                onClick={this.toggleProperties}
              >
                Properties
              </Button>
            )}
            {downloadOptions &&
              downloadOptions.length > 0 && (
                <Dropdown overlay={generateDownloadMenu(downloadOptions)}>
                  <Button icon="download">Export</Button>
                </Dropdown>
              )}
            <Mutation<OutputResult, { id: string; visible: boolean }>
              mutation={SET_RESULT_VISIBILITY}
            >
              {(setResultVisibility, res) => (
                <AsyncButton
                  onClick={() =>
                    tryOperation({
                      op: () =>
                        setResultVisibility({
                          variables: { id, visible: !visible },
                          awaitRefetchQueries: true,
                          refetchQueries: [
                            {
                              query: gql`
                                query workspace($workspaceId: ID!) {
                                  workspace(id: $workspaceId) {
                                    id
                                    results {
                                      id
                                      visible
                                    }
                                  }
                                }
                              `,
                              variables: { workspaceId }
                            }
                          ]
                        }),
                      successTitle: () => 'Visibility changed',
                      successMessage: () =>
                        !visible
                          ? 'Result is now visible via the published link.'
                          : 'Result is now exclusively visible to you.'
                    })
                  }
                  tooltip={visible ? 'Public' : 'Private'}
                  icon={visible ? 'unlock' : 'lock'}
                />
              )}
            </Mutation>
          </Button.Group>
        }
      >
        {showProperties ? (
          <>
            {properties}
            <Divider />
          </>
        ) : null}
        {children}

        {!!description && (
          <>
            <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
            <Card.Meta description={description} />
          </>
        )}
      </Card>
    );
  }
}
