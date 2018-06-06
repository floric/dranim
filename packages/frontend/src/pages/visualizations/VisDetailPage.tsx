import * as React from 'react';

import { Card, Col, Row } from 'antd';
import { RouteComponentProps } from 'react-router';

import { PageHeaderCard } from '../../components/PageHeaderCard';

export interface IWorkspacesPageProps
  extends RouteComponentProps<{ id: string }> {}

export default class WorkspacesPage extends React.Component<
  IWorkspacesPageProps
> {
  public render() {
    return (
      <>
        <PageHeaderCard title="Visualization" typeTitle="Visualization" />
        <Row>
          <Col>
            <Card>
              <p>Test</p>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
