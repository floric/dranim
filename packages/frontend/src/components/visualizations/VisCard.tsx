import * as React from 'react';

import { GQLOutputResult } from '@masterthesis/shared';
import { Button, Card, Divider, Dropdown, Icon, Menu } from 'antd';

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

export class VisCard extends React.Component<VisCardProps, VisCardState> {
  public state: VisCardState = {
    showProperties: false
  };

  private toggleProperties = () =>
    this.setState({ showProperties: !this.state.showProperties });

  public render() {
    const { result, children, downloadOptions, properties } = this.props;
    const { showProperties } = this.state;

    return (
      <Card
        title={result.name}
        bordered={false}
        style={{ marginBottom: 8 }}
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

        {!!result.description && (
          <>
            <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
            <Card.Meta description={result.description} />
          </>
        )}
      </Card>
    );
  }
}
