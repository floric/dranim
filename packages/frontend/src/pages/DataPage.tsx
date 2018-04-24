import * as React from 'react';
import { Row, Col, Card, Button } from 'antd';
import NumberInfo from 'ant-design-pro/lib/NumberInfo';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { CreateDataSetForm } from './forms/CreateDatasetForm';
import { ALL_DATASETS } from '../App';
import { tryOperation } from '../utils/form';

const CREATE_DATASET = gql`
  mutation createDataset($name: String!) {
    createDataset(name: $name) {
      id
    }
  }
`;

const DELETE_DATASET = gql`
  mutation deleteDataset($id: String!) {
    deleteDataset(id: $id)
  }
`;

class DataPage extends React.Component<{
  onAddDataset: (name: string) => void;
}> {
  public render() {
    return (
      <Query query={ALL_DATASETS}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          return (
            <Row gutter={12} style={{ marginBottom: 12 }}>
              {data.datasets.map(ds => (
                <Col
                  key={`card-${ds.id}`}
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  xl={{ span: 8 }}
                  style={{ marginBottom: 12 }}
                >
                  <Card title={ds.name} bordered={false}>
                    <Row>
                      <Col xs={{ span: 24 }} md={{ span: 12 }}>
                        <NumberInfo
                          total={ds.valueschemas.length}
                          title="Schemas"
                        />
                      </Col>
                      <Col xs={{ span: 24 }} md={{ span: 12 }}>
                        <NumberInfo
                          gap={0}
                          total={ds.entries.length}
                          title="Entries"
                        />
                      </Col>
                    </Row>
                    <Row
                      type="flex"
                      justify="end"
                      style={{ marginTop: 12 }}
                      gutter={8}
                    >
                      <Col>
                        <Button icon="ellipsis" />
                      </Col>
                      <Col>
                        <Mutation mutation={DELETE_DATASET}>
                          {deleteDataset => (
                            <Button
                              icon="delete"
                              onClick={() =>
                                tryOperation({
                                  op: () =>
                                    deleteDataset({
                                      variables: {
                                        id: ds.id
                                      }
                                    }),
                                  refetch,
                                  successTitle: 'Dataset deleted',
                                  successMessage: `Dataset "${
                                    ds.name
                                  }" deleted successfully.`,
                                  failedTitle: 'Dataset not deleted.',
                                  failedMessage: `Dataset "${
                                    ds.name
                                  }" deletion failed.`
                                })
                              }
                            >
                              Delete
                            </Button>
                          )}
                        </Mutation>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
              <Col
                xs={{ span: 24 }}
                md={{ span: 12 }}
                xl={{ span: 8 }}
                style={{ marginBottom: 12 }}
              >
                <Card bordered={false}>
                  <h2>New Dataset</h2>
                  <Mutation mutation={CREATE_DATASET}>
                    {(createDataset, {}) => (
                      <CreateDataSetForm
                        handleCreateDataset={name =>
                          tryOperation({
                            op: () => createDataset({ variables: { name } }),
                            refetch,
                            successTitle: 'Dataset created',
                            successMessage: `Dataset "${name}" created successfully.`,
                            failedTitle: 'Dataset not deleted.',
                            failedMessage: `Dataset  "${name}" creation failed.`
                          })
                        }
                      />
                    )}
                  </Mutation>
                </Card>
              </Col>
            </Row>
          );
        }}
      </Query>
    );
  }
}

export default withPageHeaderHoC({ title: 'Data', includeInCard: false })(
  DataPage
);
