import * as React from 'react';
import { withPageHeaderHoC } from '../components/PageHeaderHoC';

class VisPage extends React.Component<{}, {}> {
  public render() {
    return <div>Vis</div>;
  }
}

export default withPageHeaderHoC({ title: 'Visualizations' })(VisPage);
