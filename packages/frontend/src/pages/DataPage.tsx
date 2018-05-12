import * as React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'antd';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { CreateDataSetForm } from './forms/CreateDatasetForm';
import { ALL_DATASETS } from '../App';
import { tryOperation } from '../utils/form';
import { Dataset } from '../utils/model';
import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { NumberInfo } from '../components/NumberInfo';

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

export default class DataPage extends React.Component<{}, { saving: boolean }> {
  public componentWillMount() {
    this.setState({ saving: false });
  }

  public render() {
    return (
      <>
        <PageHeaderCard title="Datasets" />
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
                {data.datasets.map((ds: Dataset) => (
                  <Col
                    key={`card-${ds.id}`}
                    sm={{ span: 24 }}
                    md={{ span: 12 }}
                    xl={{ span: 6 }}
                    style={{ marginBottom: 12 }}
                  >
                    <Card
                      title={<Link to={`/data/${ds.id}`}>{ds.name}</Link>}
                      bordered={false}
                    >
                      <Row>
                        <Col xs={{ span: 24 }} md={{ span: 12 }}>
                          <NumberInfo
                            total={ds.valueschemas.length}
                            title="Schemas"
                          />
                        </Col>
                        <Col xs={{ span: 24 }} md={{ span: 12 }}>
                          <NumberInfo total={ds.entriesCount} title="Entries" />
                        </Col>
                      </Row>
                      <Row
                        type="flex"
                        justify="end"
                        style={{ marginTop: 12 }}
                        gutter={8}
                      >
                        <Col>
                          <Mutation mutation={DELETE_DATASET}>
                            {deleteDataset => (
                              <AsyncButton
                                confirmClick
                                confirmMessage="Delete Dataset?"
                                icon="delete"
                                loading={this.state.saving}
                                onClick={async () => {
                                  this.setState({ saving: true });
                                  await tryOperation({
                                    op: () =>
                                      deleteDataset({
                                        variables: {
                                          id: ds.id
                                        }
                                      }),
                                    refetch,
                                    successTitle: () => 'Dataset deleted',
                                    successMessage: () =>
                                      `Dataset "${
                                        ds.name
                                      }" deleted successfully.`,
                                    failedTitle: 'Dataset not deleted.',
                                    failedMessage: `Dataset "${
                                      ds.name
                                    }" deletion failed.`
                                  });
                                  this.setState({ saving: false });
                                }}
                              >
                                Delete
                              </AsyncButton>
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
                      {createDataset => (
                        <CreateDataSetForm
                          handleCreateDataset={name =>
                            tryOperation({
                              op: async () => {
                                await createDataset({ variables: { name } });
                                return true;
                              },
                              refetch,
                              successTitle: () => 'Dataset created',
                              successMessage: () =>
                                `Dataset "${name}" created successfully.`,
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
      </>
    );
  }
}
