import * as React from 'react';

import { Dataset, ProcessState, UploadProcess } from '@masterthesis/shared';
import { Button, Card, Col, Form, Icon, Row, Table, Upload } from 'antd';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import {
  Mutation,
  MutationFn,
  Query,
  withApollo,
  WithApolloClient
} from 'react-apollo';

import { UploadFile } from 'antd/lib/upload/interface';
import { AsyncButton } from '../../components/AsyncButton';
import { LoadingCard, UnknownErrorCard } from '../../components/CustomCards';
import { NumberInfo } from '../../components/NumberInfo';
import { ProcessTime } from '../../components/ProcessTime';
import { tryOperation } from '../../utils/form';

const UPLOAD_ENTRIES_CSV = gql`
  mutation($files: [Upload!]!, $datasetId: String!) {
    uploadEntriesCsv(files: $files, datasetId: $datasetId) {
      id
    }
  }
`;

export const ALL_UPLOADS = gql`
  query dataset($datasetId: String!) {
    uploads(datasetId: $datasetId) {
      id
      state
      start
      finish
      errors {
        name
        message
        count
      }
      fileNames
      addedEntries
      failedEntries
      invalidEntries
    }
  }
`;

export interface DataActionsProps {
  dataset: Dataset;
  refetch: () => Promise<ApolloQueryResult<any>>;
}

export interface DataActionsState {
  fileList: Array<UploadFile>;
  uploading: boolean;
}

export const DatasetActions = withApollo<DataActionsProps>(
  class DatasetActionsImpl extends React.Component<
    DataActionsProps & WithApolloClient<{}>,
    DataActionsState
  > {
    public componentWillMount() {
      this.setState({
        fileList: [],
        uploading: false
      });
    }

    private handleUpload = async (
      uploadEntriesCsv: MutationFn<
        {},
        { files: Array<UploadFile>; datasetId: string }
      >
    ) => {
      const { fileList } = this.state;
      const { dataset, client } = this.props;

      tryOperation({
        op: async () => {
          await this.setState({
            uploading: true,
            fileList: []
          });

          await uploadEntriesCsv({
            variables: {
              files: fileList,
              datasetId: dataset.id
            }
          });

          await this.setState({
            uploading: false
          });
        },
        refetch: client.reFetchObservableQueries,
        onFail: () => this.setState({ uploading: false }),
        failedTitle: 'Upload failed',
        successTitle: () => 'Upload successfull',
        failedMessage: 'Upload has failed.',
        successMessage: res => 'Upload succesfull. Processing is in progress.'
      });
    };

    public render() {
      const uploadProps = {
        onRemove: file => {
          this.setState(({ fileList }) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            return {
              fileList: newFileList
            };
          });
        },
        beforeUpload: file => {
          this.setState(({ fileList }) => ({
            fileList: [...fileList, file]
          }));
          return false;
        },
        fileList: this.state.fileList,
        multiple: true
      };
      const { dataset } = this.props;
      const { uploading } = this.state;

      return (
        <Query query={ALL_UPLOADS} variables={{ datasetId: dataset.id }}>
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <LoadingCard />;
            }

            if (error) {
              return <UnknownErrorCard error={error} />;
            }

            const entriesDataSource = data.uploads.map((u: UploadProcess) => ({
              key: u.id,
              time: { start: u.start, finish: u.finish },
              state:
                u.state === ProcessState.SUCCESSFUL ? (
                  <Icon type="check-circle" />
                ) : u.state === ProcessState.ERROR ? (
                  <Icon type="exclamation-circle" />
                ) : (
                  <Icon type="clock-circle" />
                ),
              errors: u.errors.map(e => `${e.message} (${e.count})`),
              results: {
                added: u.addedEntries.toLocaleString(),
                failed: u.failedEntries.toLocaleString(),
                invalid: u.invalidEntries.toLocaleString()
              }
            }));

            const entriesColumns = [
              {
                title: 'State',
                dataIndex: 'state',
                key: 'state'
              },
              {
                title: 'Time',
                dataIndex: 'time',
                key: 'time',
                render: time => (
                  <ProcessTime start={time.start} finish={time.finish} />
                )
              },
              {
                title: 'Results',
                dataIndex: 'results',
                key: 'results',
                render: u => (
                  <Row>
                    <Col xs={8}>
                      <NumberInfo title="Added" total={u.added} />
                    </Col>
                    <Col xs={8}>
                      <NumberInfo title="Failed" total={u.failed} />
                    </Col>
                    <Col xs={8}>
                      <NumberInfo title="Invalid" total={u.invalid} />
                    </Col>
                  </Row>
                )
              },
              {
                title: 'Errors',
                dataIndex: 'errors',
                key: 'errors'
              }
            ];

            return (
              <>
                <Row gutter={12}>
                  <Col
                    xs={{ span: 24 }}
                    md={{ span: 12 }}
                    xl={{ span: 8 }}
                    style={{ marginBottom: 12 }}
                  >
                    <Card bordered={false}>
                      <h3>Upload</h3>
                      <Mutation mutation={UPLOAD_ENTRIES_CSV}>
                        {uploadEntriesCsv => (
                          <>
                            <Row style={{ marginBottom: 12 }}>
                              <Col>
                                <Upload {...uploadProps}>
                                  <Button>
                                    <Icon type="upload" /> Select CSV file
                                  </Button>
                                </Upload>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <AsyncButton
                                  type="primary"
                                  onClick={() =>
                                    this.handleUpload(uploadEntriesCsv)
                                  }
                                  disabled={this.state.fileList.length === 0}
                                >
                                  {uploading ? 'Uploading...' : 'Start Upload'}
                                </AsyncButton>
                              </Col>
                            </Row>
                          </>
                        )}
                      </Mutation>
                    </Card>
                  </Col>
                  <Col
                    xs={{ span: 24 }}
                    md={{ span: 12 }}
                    xl={{ span: 8 }}
                    style={{ marginBottom: 12 }}
                  >
                    <Card bordered={false}>
                      <h3>Export</h3>
                      <Row>
                        <Col>
                          <Form layout="inline">
                            <Form.Item label="Export entries">
                              <Row gutter={12}>
                                <Col span={12}>
                                  <AsyncButton
                                    type="primary"
                                    disabled
                                    onClick={async () => 0}
                                  >
                                    as CSV
                                  </AsyncButton>
                                </Col>
                                <Col span={12}>
                                  <AsyncButton
                                    type="primary"
                                    disabled
                                    onClick={async () => 0}
                                  >
                                    as ZIP
                                  </AsyncButton>
                                </Col>
                              </Row>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Card bordered={false}>
                    <h3>Uploads</h3>
                    <Table
                      size="small"
                      dataSource={entriesDataSource}
                      columns={entriesColumns}
                    />
                  </Card>
                </Row>
              </>
            );
          }}
        </Query>
      );
    }
  }
);
