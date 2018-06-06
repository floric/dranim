import * as React from 'react';

import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { PageHeaderCard } from '../components/PageHeaderCard';
import { tryOperation } from '../utils/form';
import { CreateVisForm } from './forms/CreateVisForm';

const CREATE_VIS = gql`
  mutation createVisualization($name: String!, $datasetId: String!) {
    createVisualization(name: $name, datasetId: $datasetId) {
      id
    }
  }
`;

export const DELETE_VIS = gql`
  mutation deleteVisualization($id: String!) {
    deleteVisualization(id: $id)
  }
`;

export const ALL_VIS = gql`
  {
    visualizations {
      id
      name
    }
  }
`;

export default class VisPage extends React.Component<{}, {}> {
  public render() {
    return (
      <>
        <PageHeaderCard title="Visualizations" />
        <Row gutter={12} style={{ marginBottom: 12 }}>
          <Col xs={{ span: 24 }} md={{ span: 12 }} style={{ marginBottom: 12 }}>
            <Card bordered={false}>
              <Mutation mutation={CREATE_VIS}>
                {createVis => (
                  <CreateVisForm
                    handleCreate={(name, datasetId) =>
                      tryOperation({
                        op: async () => {
                          await createVis({ variables: { name, datasetId } });
                          return true;
                        },
                        successTitle: () => 'Visualization created',
                        successMessage: () =>
                          `Visualization "${name}" created successfully.`,
                        failedTitle: 'Visualization not created.',
                        failedMessage: `Visualization  "${name}" creation failed.`
                      })
                    }
                  />
                )}
              </Mutation>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
