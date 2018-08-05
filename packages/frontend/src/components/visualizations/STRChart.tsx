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

const MINIMUM_OPACITY = 0.15;
const WEST_PASSAGE_COLOR = '#FAAB43';
const EAST_PASSAGE_COLOR = '#003E61';
const HEIGHT = 700;
const DIST = 120;
const OFFSET_X = 50;
const OFFSET_Y = 30;
const GAP_DISTANCE = 200;

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
    const h = 800;

    const chart = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('width', w)
      .attr('height', h)
      .append('svg:g')
      .style('font-family', LABEL_FONT_FAMILY)
      .style('font-size', LABEL_FONT_SIZE)
      .style('font-weight', LABEL_FONT_WEIGHT);

    renderNames(chart, value.values.cities.west, cityPositions, true);
    renderNames(chart, value.values.cities.east, cityPositions, false);
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
  const beta = Math.atan(HEIGHT / 2 / DIST);
  const alpha = Math.PI - 2 * beta;
  const radius =
    Math.sqrt(Math.pow(DIST, 2) + Math.pow(HEIGHT / 2, 2)) /
    (Math.sin(alpha / 2) * 2);

  const scaleToCircle = d3
    .scaleLinear()
    .domain([0, citiesMap.filter(n => n.isWest === isWest).length])
    .range(isWest ? [Math.PI - alpha, Math.PI + alpha] : [-alpha, alpha]);
  citiesMap.forEach((c, i) => {
    const value = scaleToCircle(i);
    const pos = calculateCirclePos(
      value,
      radius,
      isWest ? radius + OFFSET_X : -radius + OFFSET_X + DIST * 2 + GAP_DISTANCE,
      HEIGHT / 2 + OFFSET_Y
    );
    cityPositions.set(c.name, pos);
  });

  chart
    .selectAll(`text.${svgKey}`)
    .data(citiesMap)
    .enter()
    .append('text')
    .attr('class', svgKey)
    .text(d => d.name)
    .attr('x', d => cityPositions.get(d.name).x)
    .attr('y', d => cityPositions.get(d.name).y)
    .style('opacity', d =>
      getScaledOpacity(d.maxValue, maxVal, MINIMUM_OPACITY)
    )
    .style('alignment-baseline', 'middle')
    .style('fill', 'black')
    .style('text-anchor', isWest ? 'end' : 'start');
};

const getScaledOpacity = (value: number, max: number, minimumValue: number) =>
  (value / max) * (1 - minimumValue) + minimumValue;

const calculateCirclePos = (
  value: number,
  radius: number,
  xOffset: number,
  yOffset: number
) => {
  const x = radius * Math.cos(value) + xOffset;
  const y = radius * Math.sin(value) + yOffset;
  return { x, y };
};
