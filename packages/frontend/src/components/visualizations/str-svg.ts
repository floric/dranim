import * as d3 from 'd3';
import {
  SOUND_BAR_OFFSET,
  STRChartCardState,
  TEXT_OFFSET
} from './STRChartCard';
import { LABEL_FONT_FAMILY, LABEL_FONT_SIZE } from './styles';

interface Passage {
  source: string;
  destination: string;
  isEastPassage: boolean;
  value: number;
}

interface CityStat {
  isWest: boolean;
  name: string;
  maxValue: number;
  importVolume: number;
  exportVolume: number;
}

interface Cities {
  west: { [name: string]: CityStat };
  east: { [name: string]: CityStat };
}

export const renderSTRChart = (
  containerId: string,
  cities: Cities,
  passages: Array<Passage>,
  state: STRChartCardState,
  width: number,
  height: number
) => {
  d3.select(`#${containerId}`)
    .selectAll('svg')
    .remove();

  const cityPositions: Map<string, { x: number; y: number }> = new Map();
  const chart = d3
    .select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  renderSound(chart, passages, cityPositions, state);
  renderNames(chart, cities.west, cityPositions, true, state);
  renderNames(chart, cities.east, cityPositions, false, state);
  renderPassages(chart, passages, cityPositions, state);
};

const renderSound = (
  chart: d3.Selection<d3.BaseType, {}, HTMLElement, any>,
  passages: Array<Passage>,
  cityPositions: Map<string, { x: number; y: number }>,
  state: STRChartCardState
) => {
  if (state.soundNames.length === 0) {
    return;
  }

  const { x, y } = getSoundPos(state);
  state.soundNames.forEach(s => {
    cityPositions.set(s, { x, y });
  });

  const importsToSound = passages
    .filter(
      n =>
        state.soundNames.find(soundName => soundName === n.destination) !==
        undefined
    )
    .map(n => n.value)
    .reduce((a, b) => a + b, 0);
  const exportsFromSound = passages
    .filter(
      n =>
        state.soundNames.find(soundName => soundName === n.source) !== undefined
    )
    .map(n => n.value)
    .reduce((a, b) => a + b, 0);

  const soundWrapper = chart.append('svg:g').attr('stroke-width', 10);
  soundWrapper
    .append('path')
    .attr('d', () => {
      const topPos = { x, y };
      const bottomPos = {
        x,
        y: y + state.height * state.container.height + SOUND_BAR_OFFSET * 2
      };
      return `M ${topPos.x} ${topPos.y} L ${bottomPos.x} ${bottomPos.y} L ${
        topPos.x
      } ${topPos.y}`;
    })
    .attr('stroke', '#000')
    .attr('opacity', 0.2);
  soundWrapper
    .append('text')
    .text(renderName('Sound', exportsFromSound, importsToSound))
    .attr('x', x)
    .attr('y', () => y - 10)
    .style('font-family', LABEL_FONT_FAMILY)
    .style('font-size', '18px')
    .style('text-anchor', 'middle');
};

const getSoundPos = (state: STRChartCardState) => ({
  x: state.offsets[0] * state.container.width,
  y:
    (state.container.height - state.height) * (state.offsets[1] - 0.5) -
    SOUND_BAR_OFFSET
});

const renderName = (
  name: string,
  importValue: number,
  exportValue: number,
  ioFirst: boolean = false
) =>
  ioFirst === true
    ? `(↑${exportValue}|↓${importValue}) ${name}`
    : `${name} (↑${exportValue}|↓${importValue})`;

const renderPassages = (
  chart: d3.Selection<d3.BaseType, {}, HTMLElement, any>,
  values: Array<Passage>,
  cityPositions: Map<string, { x: number; y: number }>,
  state: STRChartCardState
) => {
  const maxEastPassageVal = d3.max(
    values.filter(n => n.isEastPassage).map(n => n.value)
  );
  const maxWestPassageVal = d3.max(
    values.filter(n => !n.isEastPassage).map(n => n.value)
  );

  chart
    .append('svg:g')
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .selectAll('path.passages')
    .data(values)
    .enter()
    .append('path')
    .attr('d', d => {
      const sourcePos = cityPositions.get(d.source);
      const destPos = cityPositions.get(d.destination);

      return `M ${sourcePos.x} ${
        d.isEastPassage ? sourcePos.y : sourcePos.y + 2
      } L ${destPos.x} ${d.isEastPassage ? destPos.y : destPos.y + 2} L ${
        sourcePos.x
      } ${d.isEastPassage ? sourcePos.y : sourcePos.y + 2}`;
    })
    .attr(
      'stroke',
      d =>
        d.isEastPassage ? state.colors.eastPassage : state.colors.westPassage
    )
    .attr(
      'opacity',
      d => d.value / (d.isEastPassage ? maxEastPassageVal : maxWestPassageVal)
    );
};

const renderNames = (
  chart: d3.Selection<d3.BaseType, {}, HTMLElement, any>,
  cities: any,
  cityPositions: Map<string, { x: number; y: number }>,
  isWest: boolean,
  state: STRChartCardState
) => {
  const cityStats: Array<CityStat> = Object.entries(cities)
    .filter(
      n => state.soundNames.find(soundName => soundName === n[0]) === undefined
    )
    .map(n => ({ name: n[0], ...(n[1] as CityStat) }))
    .map(n => ({
      maxValue: Math.max(n.importVolume, n.exportVolume),
      ...n
    }));

  setCityPositions(cityStats, isWest, cityPositions, state);

  const svgKey = isWest ? 'westcities' : 'eastcities';
  const maxVal = d3.max(cityStats.map(n => n.maxValue));

  chart
    .append('svg:g')
    .style('font-family', LABEL_FONT_FAMILY)
    .style('font-size', LABEL_FONT_SIZE)
    .style('dominant-baseline', 'central')
    .style('fill', 'black')
    .style('text-anchor', isWest ? 'end' : 'start')
    .selectAll(`text.${svgKey}`)
    .data(cityStats)
    .enter()
    .append('text')
    .attr('class', svgKey)
    .text(d => renderName(d.name, d.importVolume, d.exportVolume, d.isWest))
    .attr(
      'x',
      d => cityPositions.get(d.name).x + (d.isWest ? -TEXT_OFFSET : TEXT_OFFSET)
    )
    .attr('y', d => cityPositions.get(d.name).y)
    .style('opacity', d =>
      getScaledOpacity(d.maxValue, maxVal, state.colors.minTextOpacity)
    );
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

const setCityPositions = (
  cityStats: Array<CityStat>,
  isWest: boolean,
  cityPositions: Map<string, { x: number; y: number }>,
  state: STRChartCardState
) => {
  const cityNames = cityStats.map(n => n.name);
  if (state.curveDistance === 0) {
    cityNames.forEach((c, i) => {
      cityPositions.set(c, {
        x: isWest
          ? (state.offsets[0] - state.gapDistance / 2) * state.container.width
          : (state.offsets[0] + state.gapDistance / 2) * state.container.width,
        y:
          (state.offsets[1] - 0.5 + (i / cityStats.length) * state.height) *
          state.container.height
      });
    });
    return;
  }

  const beta = Math.atan(
    (state.height / 2 / (state.curveDistance * state.container.width)) *
      state.container.height
  );
  const alpha = Math.PI - 2 * beta;
  const radius =
    Math.sqrt(
      Math.pow(state.curveDistance * state.container.width, 2) +
        Math.pow((state.height * state.container.height) / 2, 2)
    ) /
    (Math.sin(alpha / 2) * 2);

  const scaleToCircle = d3
    .scaleLinear()
    .domain([0, cityStats.filter(n => n.isWest === isWest).length])
    .range(isWest ? [Math.PI - alpha, Math.PI + alpha] : [-alpha, alpha]);
  cityNames.forEach((c, i) => {
    const value = scaleToCircle(
      isWest ? cityStats.length - (i + 0.5) : i + 0.5
    );
    const pos = calculateCirclePos(
      value,
      radius,
      isWest
        ? radius +
          (state.offsets[0] - state.gapDistance / 2) * state.container.width
        : -radius +
          (state.offsets[0] + state.gapDistance / 2) * state.container.width,
      (state.offsets[1] - 0.5 + state.height * 0.5) * state.container.height
    );
    cityPositions.set(c, pos);
  });
};
