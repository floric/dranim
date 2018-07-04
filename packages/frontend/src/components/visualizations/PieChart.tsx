import * as d3 from 'd3';
import * as React from 'react';

import { SVGChartWithId } from '../CustomDataRenderer';
import { LABEL_COLOR, LABEL_FONT_FAMILY, LABEL_FONT_SIZE } from './styles';

export interface PieChartProps extends SVGChartWithId {
  value: any;
}

export class PieChart extends React.Component<PieChartProps> {
  public componentDidMount() {
    const { value, containerId } = this.props;
    if (
      !value.values ||
      value.values.length === 0 ||
      value.values[0].label == null ||
      value.values[0].value == null
    ) {
      throw new Error('Unsupported value');
    }

    const values: Array<{ label: string; value: number }> = value.values;

    const w = 300;
    const h = 300;
    const r = 150;

    const vis = d3
      .select(`#${containerId}`)
      .append('svg')
      .data([values])
      .attr('width', w)
      .attr('height', h)
      .append('svg:g')
      .attr('transform', 'translate(' + r + ',' + r + ')');

    const arc = d3.arc().outerRadius(r);
    const pie = d3.pie().value(d => (d as any).value);
    const arcs = vis
      .selectAll('g.slice')
      .data(pie as any)
      .enter()
      .append('svg:g')
      .attr('class', 'slice');

    const path = d3
      .arc()
      .outerRadius(r)
      .innerRadius(0);

    arcs
      .append('svg:path')
      .style('fill', (d, i) => d3.interpolateRainbow(i / values.length))
      .attr('d', path);

    arcs
      .append('svg:text')
      .attr('transform', (d: any) => {
        d.innerRadius = 0;
        d.outerRadius = r;
        return 'translate(' + arc.centroid(d) + ')';
      })
      .style('font-family', LABEL_FONT_FAMILY)
      .style('font-size', LABEL_FONT_SIZE)
      .style('font-weight', 'bold')
      .style('fill', LABEL_COLOR)
      .style('text-anchor', 'middle')
      .text((d, i) => values[i].label);
  }

  public render() {
    return <div id={this.props.containerId} />;
  }
}
