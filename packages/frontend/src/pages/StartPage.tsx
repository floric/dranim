import * as React from 'react';
import gql from 'graphql-tag';
import { Button } from 'antd';
import { Mutation } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';

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
          <Button
            onClick={async () => {
              await createSTRDemoData();
            }}
          >
            Create STR Demo data
          </Button>
        )}
      </Mutation>
    );
  }
}

export default withPageHeaderHoC({ title: 'Start' })(StartPage);
