import React, { Component } from 'react';

import {
  GQLDataset,
  GQLUploadProcess,
  ProcessState,
  UploadProcess
} from '@masterthesis/shared';
import { Button, Card, Col, Form, Icon, Row, Table, Upload } from 'antd';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import {
  Mutation,
  MutationFn,
  withApollo,
  WithApolloClient
} from 'react-apollo';

import { UploadFile } from 'antd/lib/upload/interface';
import { AsyncButton } from '../../components/AsyncButton';
import { HandledQuery } from '../../components/HandledQuery';
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

export interface DataActionsPageProps {
  dataset: GQLDataset;
  refetch: () => Promise<ApolloQueryResult<any>>;
}

export interface DataActionsState {
  fileList: Array<UploadFile>;
  uploading: boolean;
}

export const DataActionsPage = withApollo<DataActionsPageProps>(
  class DatasetActionsImpl extends Component<
    DataActionsPageProps & WithApolloClient<{}>,
    DataActionsState
  > {
    public state: DataActionsState = {
      fileList: [],
      uploading: false
    };

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
        successTitle: () => 'Upload successful',
        failedMessage: 'Upload has failed.',
        successMessage: () => 'Upload succesful. Processing is in progress.'
      });
    };

    private getUploadProps = () => ({
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
    });

    public render() {
      const { dataset } = this.props;
      const { uploading } = this.state;

      return (
        <HandledQuery<
          { uploads: Array<GQLUploadProcess> },
          { datasetId: string }
        >
          query={ALL_UPLOADS}
          variables={{ datasetId: dataset.id }}
        >
          {({ data: { uploads } }) => (
            <>
              <Row gutter={12}>
                <Col
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  xl={{ span: 8 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <Card bordered={false}>
                    <h3>Import</h3>
                    <Mutation
                      mutation={UPLOAD_ENTRIES_CSV}
                      context={{ hasUpload: true }}
                    >
                      {uploadEntriesCsv => (
                        <>
                          <Row style={{ marginBottom: '1rem' }}>
                            <Col>
                              <Upload {...this.getUploadProps()}>
                                <Button icon="upload">Select CSV file</Button>
                              </Upload>
                            </Col>
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
                  style={{ marginBottom: '1rem' }}
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
                  <h3>Last Imports</h3>
                  <Table
                    size="small"
                    pagination={{ size: 'small', hideOnSinglePage: true }}
                    dataSource={generateDatasource(uploads)}
                    columns={COLUMNS}
                  />
                </Card>
              </Row>
            </>
          )}
        </HandledQuery>
      );
    }
  }
);

const generateDatasource = (uploads: Array<UploadProcess>) =>
  uploads.map((u: UploadProcess) => ({
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

const COLUMNS = [
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state'
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
    render: time => <ProcessTime start={time.start} finish={time.finish} />
  },
  {
    title: 'Results',
    dataIndex: 'results',
    key: 'results',
    render: u => (
      <Row>
        <Col xs={8}>{`${u.added} added`}</Col>
        <Col xs={8}>{`${u.failed} failed`}</Col>
        <Col xs={8}>{`${u.invalid} invalid`}</Col>
      </Row>
    )
  },
  {
    title: 'Errors',
    dataIndex: 'errors',
    key: 'errors'
  }
];
