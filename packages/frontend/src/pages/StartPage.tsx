import React, { SFC } from 'react';

import { Alert, Card, Col, Divider, Icon, List, Row } from 'antd';
import gql from 'graphql-tag';
import moment from 'moment';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../components/AsyncButton';
import { PageHeaderCard } from '../components/layout/PageHeaderCard';
import { tryMutation } from '../utils/form';
import { news, NewsType } from './news';

const CREATE_DEMO_DATA = gql`
  mutation createDemoData($type: String!) {
    createDemoData(type: $type)
  }
`;

const CreateExampleButton: SFC<{ type: string }> = ({ type }) => (
  <Mutation mutation={CREATE_DEMO_DATA}>
    {createDemoData => (
      <AsyncButton
        icon="plus-square"
        onClick={() =>
          tryMutation({
            op: () =>
              createDemoData({
                variables: { type },
                awaitRefetchQueries: true,
                refetchQueries: [
                  {
                    query: gql`
                      {
                        datasets {
                          id
                          name
                        }
                        workspaces {
                          id
                          name
                        }
                      }
                    `
                  }
                ]
              }),
            successTitle: () => 'Example created',
            successMessage: () => 'Example data created successfully.',
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
      <Col style={{ marginBottom: 8 }}>
        <Alert
          message="Alpha Status"
          type="warning"
          description="This web application is not stable yet. Use with caution and feel free to report any errors which might occur."
          showIcon
        />
      </Col>
      <Col sm={24} md={12} lg={8}>
        <Card bordered={false}>
          <h2>Projects</h2>
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
            This will generate empty Tables and a sample Workspace. Note that
            you will still need to upload data.
          </p>
          <p>
            <CreateExampleButton type="STR" />
          </p>
          <Divider />
          <h2>Examples</h2>
          <h3>Birthdays</h3>
          <p>
            This example contains a Table with 25.000 randomly generated entries
            with persons. Each randomly generated entry consists of a name, a
            sex and a day of birth.
          </p>
          <p>
            <CreateExampleButton type="Birthdays" />
          </p>
          <h3>Car Manufacturers</h3>
          <p>Demo data for market shares of german car manufacturers.</p>
          <p>
            <CreateExampleButton type="Cars" />
          </p>
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
                      {item.title} ({moment(item.date).fromNow()})
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
