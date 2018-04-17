import * as React from 'react';
import { withPageHeaderHoC } from '../components/PageHeaderHoC';

class ExplorerPage extends React.Component<{}, {}> {
  public render() {
    return <div>Explorer</div>;
  }
}

export default withPageHeaderHoC({ title: 'Explorer' })(ExplorerPage);
