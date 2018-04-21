import * as React from 'react';
import { withPageHeaderHoC } from '../components/PageHeaderHoC';

class StartPage extends React.Component<{}, {}> {
  public render() {
    return <div>Start</div>;
  }
}

export default withPageHeaderHoC({ title: 'Start' })(StartPage);
