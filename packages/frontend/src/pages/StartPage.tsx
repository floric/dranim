import * as React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { AsyncButton } from '../components/AsyncButton';

const CREATE_DEMO_DATA = gql`
  mutation createSTRDemoData {
    createSTRDemoData
  }
`;

class StartPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Mutation mutation={CREATE_DEMO_DATA}>
        {(createSTRDemoData, b) => (
          <AsyncButton onClick={() => createSTRDemoData()}>
            Create STR Demo data
          </AsyncButton>
        )}
      </Mutation>
    );
  }
}

export default withPageHeaderHoC({ title: 'Start' })(StartPage);
