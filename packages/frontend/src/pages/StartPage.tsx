import * as React from 'react';

import { Card, Col, Divider, Icon, List, Row } from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { client } from '../io/apollo-client';

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

enum NewsType {
  FEATURE = 'FEATURE',
  IMPROVEMENT = 'IMPROVEMENT',
  NOTIFICATION = 'NOTIFICATION'
}

export default class StartPage extends React.Component<{}> {
  public render() {
    const news = [
      {
        type: NewsType.NOTIFICATION,
        date: new Date(2018, 7, 15),
        title: 'Next Milestones',
        description:
          'Add more neded nodes and improve calculation progress reporting.'
      },
      {
        type: NewsType.FEATURE,
        date: new Date(2018, 7, 7),
        title: 'Added STR Visualization',
        description:
          'A new visualization type for STR graphics was added. This visualization also supports interactive controls for graphi related parameters.'
      },
      {
        type: NewsType.IMPROVEMENT,
        date: new Date(2018, 7, 7),
        title: 'Calculation process and cancellation improved',
        description:
          'The calculation process has been improved. Cancellations are handled better and some performance improvements were added.'
      },
      {
        type: NewsType.FEATURE,
        date: new Date(2018, 6, 30),
        title: 'Added News to Start',
        description:
          'This start page now contains this news column as well as more information about the available examples.'
      },
      {
        type: NewsType.IMPROVEMENT,
        date: new Date(2018, 6, 30),
        title: 'UX improved',
        description:
          'The UX of calculations has been improved. A loading screen will be shown and calculations can be canceled. Additionally, more help texts have been added and the users page has been removed in favor of showing the user always on the top right corner.'
      },
      {
        type: NewsType.IMPROVEMENT,
        date: new Date(2018, 6, 29),
        title: 'Performance improvements',
        description: 'The calculation performance has been improved.'
      },
      {
        type: NewsType.FEATURE,
        date: new Date(2018, 6, 28),
        title: 'Support for multiple distinct values',
        description:
          'The Distinct node now supports multiple fields for aggregation. This was needed for efficient data analysis of passages with the STR data.'
      }
    ];

    return (
      <>
        <PageHeaderCard
          title="Start"
          helpContent={
            <p>
              This page is currently only used to create demo data fast. The
              content of this page might change in the future.
            </p>
          }
        />
        <Row gutter={8}>
          <Col sm={24} md={12} lg={8}>
            <Card bordered={false}>
              <h2>Generate Examples</h2>
              <h3>Sound Toll Registers</h3>
              <p>
                "Sound Toll Registers online (short: STR online) is the
                electronic database of the complete Sound Toll Registers (STR).
                STR online is essentially an instrument of historical analysis.
                It is a reduction of an organic historical source. It is an
                interpretation of the STR and not a direct copy or a source
                edition. STR online is certainly a powerful instrument, but it
                has its limitations. The individual researcher must be aware of
                this when he or she makes use of it."
              </p>
              <p>
                More information at{' '}
                <a href="http://www.soundtoll.nl/index.php/en/over-het-project/str-online">
                  STR online
                </a>.
              </p>
              <p>
                This will generate empty Datasets and a sample Workspace. Note
                that you will still need to upload data.
              </p>
              <Mutation mutation={CREATE_STR_DEMO_DATA}>
                {(createSTRDemoData, b) => (
                  <AsyncButton
                    icon="plus"
                    onClick={async () => {
                      await createSTRDemoData();
                      await client.reFetchObservableQueries();
                    }}
                  >
                    Create
                  </AsyncButton>
                )}
              </Mutation>
              <Divider />
              <h3>Birthdays</h3>
              <p>
                This Dataset contains 2500 randomly generated entries with
                persons. Each entry consists of a name, a random value as well
                as a birthday.
              </p>
              <Mutation mutation={CREATE_BIRTHDAYS_DEMO_DATA}>
                {(createBirthdaysDemoData, b) => (
                  <AsyncButton
                    icon="plus"
                    onClick={async () => {
                      await createBirthdaysDemoData();
                      await client.reFetchObservableQueries();
                    }}
                  >
                    Create
                  </AsyncButton>
                )}
              </Mutation>
            </Card>
          </Col>
          <Col sm={24} md={12} lg={16}>
            <Card bordered={false}>
              <h2>News</h2>
              <List
                itemLayout="horizontal"
                dataSource={news}
                renderItem={item => (
                  <List.Item grid={{ gutter: 16, column: 4 }}>
                    <List.Item.Meta
                      style={{ fontSize: 'initial', fontWeight: 'unset' }}
                      avatar={
                        item.type === NewsType.FEATURE ? (
                          <Icon type="star" />
                        ) : item.type === NewsType.IMPROVEMENT ? (
                          <Icon type="rocket" />
                        ) : (
                          <Icon type="notification" />
                        )
                      }
                      title={
                        <>
                          {item.title} ({distanceInWordsToNow(item.date, {
                            addSuffix: true
                          })})
                        </>
                      }
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
