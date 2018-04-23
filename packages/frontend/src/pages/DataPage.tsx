import * as React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'antd';
import NumberInfo from 'ant-design-pro/lib/NumberInfo';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { Spinner } from '../components/Spinner';
import { CreateDataSetForm } from './forms/CreateDatasetForm';
import { ALL_DATASETS } from '../App';

const CREATE_DATASET = gql`
  mutation createDataset($name: String!) {
    createDataset(name: $name) {
      id
    }
  }
`;

class DataPage extends React.Component<{
  onAddDataset: (name: string) => void;
}> {
  public render() {
    return (
      <Query query={ALL_DATASETS}>
        {res => {
          if (res.loading) {
            return <Spinner />;
          }
          if (res.error) {
            return null;
          }

          return (
            <Row gutter={12} style={{ marginBottom: 12 }}>
              {res.data.datasets.map(ds => (
                <Col
                  key={`card-${ds.id}`}
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  xl={{ span: 8 }}
                  style={{ marginBottom: 12 }}
                >
                  <Card bordered={false}>
                    <h2>
                      <Link to={`/data/${ds.id}`}>{ds.name}</Link>
                    </h2>
                    <Row>
                      <Col xs={{ span: 24 }} md={{ span: 12 }}>
                        <NumberInfo
                          total={ds.valueschemas.length}
                          title="Schemas"
                        />
                      </Col>
                      <Col xs={{ span: 24 }} md={{ span: 12 }}>
                        <NumberInfo total={ds.entries.length} title="Entries" />
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
                  <Mutation mutation={CREATE_DATASET}>
                    {(createDataset, { data }) => (
                      <CreateDataSetForm
                        handleCreateDataset={name => {
                          createDataset({ variables: { name } });
                        }}
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
