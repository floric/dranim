import * as React from 'react';

import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { client } from '../io/apolloClient';

const CREATE_STR_DEMO_DATA = gql`
  mutation createSTRDemoData {
    createSTRDemoData
  }
`;
const CREATE_BIRTHDAYS_DEMO_DATA = gql`
  mutation createBirthdaysDemoData {
    createBirthdaysDemoData
  }
`;

export default class StartPage extends React.Component<{}> {
  public render() {
    return (
      <>
        <PageHeaderCard title="Start" />
        <Row gutter={8}>
          <Col sm={24} md={12} lg={6}>
            <Card bordered={false}>
              <h3>Sound Toll Registers</h3>
              <Mutation mutation={CREATE_STR_DEMO_DATA}>
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
          <Col sm={24} md={12} lg={6}>
            <Card bordered={false}>
              <h3>Birthdays</h3>
              <Mutation mutation={CREATE_BIRTHDAYS_DEMO_DATA}>
                {(createBirthdaysDemoData, b) => (
                  <AsyncButton
                    onClick={async () => {
                      await createBirthdaysDemoData();
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
