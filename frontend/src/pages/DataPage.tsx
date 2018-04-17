import * as React from 'react';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';

class DataPage extends React.Component<{}, {}> {
  public render() {
    return <div>Passages or commodities here</div>;
  }
}

export default withPageHeaderHoC({ title: 'Data' })(DataPage);
