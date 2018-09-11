import React, { SFC } from 'react';

import { Card, Col, Divider, Icon, List, Row } from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/layout/PageHeaderCard';
import { client } from '../io/apollo-client';
import { tryOperation } from '../utils/form';
import { news, NewsType } from './news';

const CREATE_DEMO_DATA = gql`
  mutation createDemoData($type: String!) {
    createDemoData(type: $type)
  }
`;

const renderCreateExampleButton = (type: string) => (
  <Mutation mutation={CREATE_DEMO_DATA}>
    {createDemoData => (
      <AsyncButton
        icon="plus-square"
        onClick={() =>
          tryOperation({
            op: () =>
              createDemoData({
                variables: { type }
              }),
            refetch: client.reFetchObservableQueries,
            successTitle: () => 'Example created',
            successMessage: () => 'Example data successfully created',
            failedMessage:
              'Example creation failed. Some part might have been created nontheless',
            failedTitle: 'Example creation failed'
          })
        }
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
