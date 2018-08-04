import * as d3 from 'd3';
import * as React from 'react';

import { SVGChartWithId } from '../CustomDataRenderer';
import {
  LABEL_FONT_FAMILY,
  LABEL_FONT_SIZE,
  LABEL_FONT_WEIGHT
} from './styles';

export interface STRChartProps extends SVGChartWithId {
  value: any;
}

const MINIMUM_OPACITY = 0.3;
const WEST_PASSAGE_COLOR = '#FAAB43';
const EAST_PASSAGE_COLOR = '#003E61';

interface Passage {
  source: string;
  destination: string;
  isEastPassage: any;
  value: number;
}

interface CityStat {
  isWest: boolean;
  name: string;
  maxValue: number;
  importVolume: number;
  exportVolume: number;
}

export class STRChart extends React.Component<STRChartProps> {
  public componentDidMount() {
    const { value, containerId } = this.props;
    if (!value.values) {
      throw new Error('Unsupported value');
    }

    const cityPositions: Map<string, { x: number; y: number }> = new Map();
    const w = 800;
    const h = 1600;
    const westTextLine = 100;
    const eastTextLine = w - westTextLine;

    const chart = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('width', w)
      .attr('height', h)
      .append('svg:g')
      .style('font-family', LABEL_FONT_FAMILY)
      .style('font-size', LABEL_FONT_SIZE)
      .style('font-weight', LABEL_FONT_WEIGHT);

    renderNames(
      chart,
      value.values.cities.west,
      cityPositions,
      h,
      westTextLine,
      true
    );
    renderNames(
      chart,
      value.values.cities.east,
      cityPositions,
      h,
      eastTextLine,
      false
    );
    renderPassages(chart, value.values.passages, cityPositions);
  }

  public render() {
    return <div id={this.props.containerId} />;
  }
}

const renderPassages = (
  chart: d3.Selection<d3.BaseType, {}, HTMLElement, any>,
  values: Array<Passage>,
  cityPositions: Map<string, { x: number; y: number }>
) => {
  const maxPassageVal = d3.max(values.map(n => n.value));

  chart
    .selectAll('path.passages')
    .data(values)
    .enter()
    .append('path')
    .attr('d', d => {
      const sourcePos = cityPositions.get(d.source);
      const destPos = cityPositions.get(d.destination);

      return `M ${sourcePos.x} ${
        d.isEastPassage === 'true' ? sourcePos.y : sourcePos.y + 2
      } L ${destPos.x} ${
        d.isEastPassage === 'true' ? destPos.y : destPos.y + 2
      } L ${sourcePos.x} ${
        d.isEastPassage === 'true' ? sourcePos.y : sourcePos.y + 2
      }`;
    })
    .attr('fill', 'none')
    .attr(
      'stroke',
      d =>
        d.isEastPassage === 'true' ? EAST_PASSAGE_COLOR : WEST_PASSAGE_COLOR
    )
    .attr('stroke-width', 2)
    .attr('opacity', d => d.value / maxPassageVal);
};

const renderNames = (
  chart: d3.Selection<d3.BaseType, {}, HTMLElement, any>,
  cities: any,
  cityPositions: Map<string, { x: number; y: number }>,
  h: number,
  xOffset: number,
  isWest: boolean
) => {
  const citiesMap: Array<CityStat> = Object.entries(cities)
    .map(n => ({ name: n[0], ...(n[1] as CityStat) }))
    .map(n => ({
      maxValue: Math.max(n.importVolume, n.exportVolume),
      ...n
    }));
  const svgKey = isWest ? 'westcities' : 'eastcities';
  const maxVal = d3.max(citiesMap.map(n => n.maxValue));
  const scaleY = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, h / citiesMap.length]);

  const names = chart
    .selectAll(`text.${svgKey}`)
    .data(citiesMap)
    .enter()
    .append('text')
    .attr('class', svgKey);
  names
    .text(d => d.name)
    .attr('x', xOffset)
    .attr('y', (d, i) => {
      const y = scaleY(i + 1);
      cityPositions.set(d.name, { x: xOffset, y });
      return y;
    })
    .style('opacity', d =>
      getScaledOpacity(d.maxValue, maxVal, MINIMUM_OPACITY)
    )
    .style('alignment-baseline', 'middle')
    .style('fill', 'black')
    .style('text-anchor', isWest ? 'end' : 'start');
};

const getScaledOpacity = (value: number, max: number, minimumValue: number) =>
  (value / max) * (1 - minimumValue) + minimumValue;
