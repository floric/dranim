import * as React from 'react';

import * as d3 from 'd3';
import { css } from 'glamor';
import { v4 } from 'uuid';

export interface BarChartProps {
  value: any;
}

const STYLE = css({
  font: '10px sans-serif',
  textAlign: 'right',
  color: 'white'
});

export class BarChart extends React.Component<
  BarChartProps,
  { chartId: string }
> {
  public componentWillMount() {
    this.setState({ chartId: v4() });
  }

  public componentDidMount() {
    const { value } = this.props;
    if (
      !value.values ||
      value.values.length === 0 ||
      value.values[0].label == null ||
      value.values[0].value == null
    ) {
      throw new Error('Unsupported value');
    }

    const values: Array<{ label: string; value: number }> = value.values;
    const maxVal = values.map(n => n.value).reduce((a, b) => (a > b ? a : b));

    d3.select(`#c-${this.state.chartId}`)
      .selectAll('div')
      .data(values)
      .enter()
      .append('div')
      .style('width', v => (v.value * 100) / maxVal + '%')
      .style('background-color', 'steelblue')
      .style('margin', '1px')
      .style('padding', '3px')
      .text(d => d.label);
  }

  public render() {
    return <div {...STYLE} id={`c-${this.state.chartId}`} />;
  }
}
