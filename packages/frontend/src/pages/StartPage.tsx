import React, { SFC } from 'react';

import { Card, Col, Divider, Icon, List, Row } from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/layout/PageHeaderCard';
import { client } from '../io/apollo-client';

const CREATE_DEMO_DATA = gql`
  mutation createDemoData($type: String!) {
    createDemoData(type: $type)
  }
`;

enum NewsType {
  FEATURE = 'FEATURE',
  IMPROVEMENT = 'IMPROVEMENT',
  NOTIFICATION = 'NOTIFICATION'
}

const news = [
  {
    type: NewsType.NOTIFICATION,
    date: new Date(2018, 8, 15),
    title: 'Next Milestone',
    description:
      'Add more neded nodes and improve calculation speed and progress reporting.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 8, 5),
    title: 'Added more time related nodes',
    description: 'Comparisons of times and dates are now supported.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 7, 31),
    title: 'Added support for CSV download of Entries',
    description:
      'Entries of Datasets can now be downloaded as CSV streams to process them in Excel or other applications with support for CSV files.'
  },
  {
    type: NewsType.IMPROVEMENT,
    date: new Date(2018, 7, 28),
    title: 'Improved Dashboard and Visualization types',
    description:
      'The linear visualization types are now rendered with Vega. Additionally this allows PNG export. More visualization related fixes and improvements were done.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 7, 8),
    title: 'Added node for numeric comparisons',
    description:
      'Dranim now supports numeric comparisons (equals, less then, greater then) with a new node.'
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

const renderCreateExampleButton = (type: string) => (
  <Mutation mutation={CREATE_DEMO_DATA}>
    {createDemoData => (
      <AsyncButton
        icon="plus-square"
        onClick={async () => {
          await createDemoData({
            variables: { type }
          });
          await client.reFetchObservableQueries();
        }}
      >
        Create
      </AsyncButton>
    )}
  </Mutation>
);

const StartPage: SFC = () => (
  <>
    <PageHeaderCard
      title="Start"
      helpContent={
        <p>
          This page is currently only used to create demo data fast. The content
          of this page might change in the future.
        </p>
      }
    />
    <Row gutter={8}>
      <Col sm={24} md={12} lg={8}>
        <Card bordered={false}>
          <h2>Examples</h2>
          <h3>Sound Toll Registers</h3>
          <p>
            "Sound Toll Registers online (short: STR online) is the electronic
            database of the complete Sound Toll Registers (STR)." More
            information at{' '}
            <a href="http://www.soundtoll.nl/index.php/en/over-het-project/str-online">
              STR online
            </a>
          </p>
          <p>
            This will generate empty Datasets and a sample Workspace. Note that
            you will still need to upload data.
          </p>
          {renderCreateExampleButton('STR')}
          <Divider />
          <h3>Birthdays</h3>
          <p>
            This Dataset contains 2500 randomly generated entries with persons.
            Each entry consists of a name, a random value as well as a birthday.
          </p>
          {renderCreateExampleButton('Birthdays')}
          <Divider />
          <h3>Car Manufacturers</h3>
          <p>Demo data for market shares of german car manufacturers.</p>
          {renderCreateExampleButton('Cars')}
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
                    <Icon
                      type={
                        item.type === NewsType.FEATURE
                          ? 'star'
                          : item.type === NewsType.IMPROVEMENT
                            ? 'rocket'
                            : 'notification'
                      }
                    />
                  }
                  title={
                    <>
                      {item.title} (
                      {distanceInWordsToNow(item.date, {
                        addSuffix: true
                      })}
                      )
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

export default StartPage;
