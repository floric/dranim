import * as React from 'react';

import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { client } from '../io/apolloClient';

const CREATE_DEMO_DATA = gql`
  mutation createSTRDemoData {
    createSTRDemoData
  }
`;

export default class StartPage extends React.Component<{}> {
  public render() {
    return (
      <>
        <PageHeaderCard title="Start" />
        <Row>
          <Col sm={24} md={12} lg={6}>
            <Card bordered={false}>
              <h3>Sound Toll Registers</h3>
              <Mutation mutation={CREATE_DEMO_DATA}>
                {(createSTRDemoData, b) => (
                  <AsyncButton
                    onClick={async () => {
                      await createSTRDemoData();
                      await client.reFetchObservableQueries();
                    }}
                  >
                    Add Demo Data
                  </AsyncButton>
                )}
              </Mutation>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
