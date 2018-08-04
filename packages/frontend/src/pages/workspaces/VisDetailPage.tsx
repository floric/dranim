import * as React from 'react';

import { DataType, GQLOutputResult, GQLWorkspace } from '@masterthesis/shared';
import { Card, Col, Divider, Row } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import { BooleanInfo } from '../../components/BooleanInfo';
import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { CustomDataRenderer } from '../../components/CustomDataRenderer';
import { NumberInfo } from '../../components/NumberInfo';
import { StringInfo } from '../../components/StringInfo';

const WORKSPACE = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      name
      results {
        id
        name
        type
        value
        description
      }
    }
    calculations(workspaceId: $id) {
      id
      start
      finish
      state
      processedOutputs
      totalOutputs
    }
  }
`;

const resultCardSize = { md: 24 };

export interface VisDetailPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

export default class VisDetailPage extends React.Component<VisDetailPageProps> {
  public render() {
    return (
      <Query
        query={WORKSPACE}
        variables={{ id: this.props.match.params.workspaceId }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.workspace) {
            return (
              <CustomErrorCard
                title="Unknown Workspace"
                description="Workspace doesn't exist."
              />
            );
          }

          const workspace: GQLWorkspace = data.workspace;

          return (
            <Row gutter={8}>
              {workspace.results.map(r => (
                <Col {...resultCardSize} key={r.id}>
                  {renderResult(r)}
                </Col>
              ))}
            </Row>
          );
        }}
      </Query>
    );
  }
}

const renderResult = (result: GQLOutputResult): JSX.Element => {
  const value = JSON.parse(result.value);
  if (result.type !== DataType.VIS) {
    return (
      <Card bordered={false} title={result.name}>
        {(() => {
          if (result.type === DataType.NUMBER) {
            return <NumberInfo total={value} />;
          } else if (result.type === DataType.STRING) {
            return <StringInfo value={value} />;
          } else if (result.type === DataType.BOOLEAN) {
            return <BooleanInfo value={value} />;
          }

          return <p>Unsupported Datatype!</p>;
        })()}
        {!!result.description && (
          <>
            <Divider />
            <Card.Meta description={result.description} />
          </>
        )}
      </Card>
    );
  }

  return <CustomDataRenderer result={result} value={value} />;
};
