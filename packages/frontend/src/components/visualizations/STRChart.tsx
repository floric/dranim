import * as d3 from 'd3';
import * as React from 'react';

import { Col, Divider, Icon, Input, Row, Slider, Tag, Tooltip } from 'antd';

import { SVGChartWithId } from '../CustomDataRenderer';
import { SliderCol } from '../properties/Slider';
import { LABEL_FONT_FAMILY, LABEL_FONT_SIZE } from './styles';

export interface STRChartProps extends SVGChartWithId {
  value: any;
}

const MINIMUM_OPACITY = 0.15;
const WEST_PASSAGE_COLOR = '#FAAB43';
const EAST_PASSAGE_COLOR = '#003E61';
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

const GAP_DIST_DEFAULT = 200;
const GAP_DIST_MAX = CANVAS_WIDTH;
const HEIGHT_DEFAULT = 500;
const HEIGHT_MAX = 1000;
const HEIGHT_MIN = 100;
const CURVE_DEFAULT = 120;
const CURVE_MAX = 500;
const OFFSET_MAX = 1000;

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

interface STRChartState {
  gapDistance: number;
  height: number;
  curveDistance: number;
  offsets: [number, number];
  colors: {
    minTextOpacity: number;
    eastPassage: string;
    westPassage: string;
  };
  temp: {
    inputVisible: boolean;
    inputRef: React.Ref<any> | null;
    inputValue: string;
  };
  soundNames: Array<string>;
}

export class STRChart extends React.Component<STRChartProps, STRChartState> {
  public componentWillMount() {
    this.setState({
      gapDistance: GAP_DIST_DEFAULT,
      height: HEIGHT_DEFAULT,
      curveDistance: CURVE_DEFAULT,
      offsets: [0, 0],
      colors: {
        minTextOpacity: MINIMUM_OPACITY,
        eastPassage: EAST_PASSAGE_COLOR,
        westPassage: WEST_PASSAGE_COLOR
      },
      soundNames: [],
      temp: {
        inputVisible: false,
        inputRef: null,
        inputValue: ''
      }
    });
  }

  public componentDidMount() {
    this.renderChart();
  }

  public componentDidUpdate(
    prevProps: STRChartProps,
    prevState: STRChartState
  ) {
    if (
      this.state.temp.inputValue === prevState.temp.inputValue &&
      this.state.temp.inputVisible === prevState.temp.inputVisible
    ) {
      this.renderChart();
    }
  }

  private renderChart() {
    const { value, containerId } = this.props;
    if (!value.values) {
      throw new Error('Unsupported value');
    }

    d3.select(`#${containerId}`)
      .selectAll('svg')
      .remove();

    const cityPositions: Map<string, { x: number; y: number }> = new Map();
    const chart = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('width', CANVAS_WIDTH)
      .attr('height', CANVAS_HEIGHT);

    renderNames(
      chart,
      value.values.cities.west,
      cityPositions,
      true,
      this.state
    );
    renderNames(
      chart,
      value.values.cities.east,
      cityPositions,
      false,
      this.state
    );
    renderPassages(chart, value.values.passages, cityPositions, this.state);
  }

  private handleClose = removedTag => {
    const soundNames = this.state.soundNames.filter(tag => tag !== removedTag);
    this.setState({ soundNames });
  };

  private showInput = () =>
    this.setState({ temp: { ...this.state.temp, inputVisible: true } });

  private handleInputChange = e =>
    this.setState({ temp: { ...this.state.temp, inputValue: e.target.value } });

  private handleInputConfirm = () => {
    const {
      soundNames,
      temp: { inputValue }
    } = this.state;
    const newSoundNames = [...soundNames, inputValue];
    this.setState({
      soundNames: newSoundNames,
      temp: {
        ...this.state.temp,
        inputVisible: false,
        inputValue: ''
      }
    });
  };

  private saveInputRef = inputRef =>
    this.setState({ temp: { ...this.state.temp, inputRef } });

  public render() {
    const {
      temp: { inputVisible, inputValue },
      soundNames
    } = this.state;
    return (
      <>
        <Row>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Gap</p>
            <Slider
              min={0}
              max={GAP_DIST_MAX}
              defaultValue={this.state.gapDistance}
              onChange={(val: number) => {
                this.setState({ gapDistance: val });
              }}
            />
          </Col>
          <SliderCol
            label="Height"
            min={HEIGHT_MIN}
            max={HEIGHT_MAX}
            value={this.state.height}
            onChange={(val: number) => {
              this.setState({
                height: val
              });
            }}
          />
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Curviness</p>
            <Slider
              min={0}
              max={CURVE_MAX}
              defaultValue={this.state.curveDistance}
              onChange={(val: number) => {
                this.setState({ curveDistance: val });
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Offset Y</p>
            <Slider
              min={0}
              max={OFFSET_MAX}
              defaultValue={this.state.offsets[0]}
              onChange={(val: number) => {
                this.setState({
                  offsets: [this.state.offsets[0], val]
                });
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Offset X</p>
            <Slider
              min={0}
              max={OFFSET_MAX}
              defaultValue={this.state.offsets[1]}
              onChange={(val: number) => {
                this.setState({
                  offsets: [val, this.state.offsets[1]]
                });
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Minimal Opacity</p>
            <Slider
              min={0}
              max={1}
              step={0.01}
              defaultValue={this.state.colors.minTextOpacity}
              onChange={(val: number) => {
                this.setState({
                  colors: {
                    ...this.state.colors,
                    minTextOpacity: val
                  }
                });
              }}
            />
          </Col>
          <Col sm={24} md={12} lg={6}>
            <p>Colors</p>
            <Input.Group compact>
              <Input
                onChange={ev =>
                  this.setState({
                    colors: {
                      ...this.state.colors,
                      eastPassage: ev.target.value
                    }
                  })
                }
                value={this.state.colors.eastPassage}
                color={this.state.colors.eastPassage}
                prefix={
                  <Icon
                    style={{ color: this.state.colors.eastPassage }}
                    type="arrow-right"
                  />
                }
                style={{ width: '50%' }}
              />
              <Input
                value={this.state.colors.westPassage}
                onChange={ev =>
                  this.setState({
                    colors: {
                      ...this.state.colors,
                      westPassage: ev.target.value
                    }
                  })
                }
                prefix={
                  <Icon
                    style={{ color: this.state.colors.westPassage }}
                    type="arrow-left"
                  />
                }
                style={{
                  width: '50%',
                  color: this.state.colors.westPassage,
                  backgroundColor: this.state.colors.westPassage
                }}
              />
            </Input.Group>
          </Col>
          <Col sm={24} md={12} lg={6}>
            <p>Sound Names</p>
            {soundNames.map(tag => (
              <Tag
                key={tag}
                closable={true}
                afterClose={() => this.handleClose(tag)}
              >
                {tag}
              </Tag>
            ))}
            {inputVisible && (
              <Input
                ref={this.saveInputRef}
                type="text"
                size="small"
                style={{ width: 120, padding: 0, margin: 0 }}
                value={inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleInputConfirm}
                onPressEnter={this.handleInputConfirm}
              />
            )}
            {!inputVisible && (
              <Tag
                onClick={this.showInput}
                style={{ background: '#fff', borderStyle: 'dashed' }}
              >
                <Icon type="plus" /> New Tag
              </Tag>
            )}
          </Col>
        </Row>
        <Divider />
        <div id={this.props.containerId} />
      </>
    );
  }
}

const renderPassages = (
  chart: d3.Selection<d3.BaseType, {}, HTMLElement, any>,
  values: Array<Passage>,
  cityPositions: Map<string, { x: number; y: number }>,
  state: STRChartState
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
  state: STRChartState
) => {
  const cityStats: Array<CityStat> = Object.entries(cities)
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
    .style('alignment-baseline', 'middle')
    .style('fill', 'black')
    .style('text-anchor', isWest ? 'end' : 'start')
    .selectAll(`text.${svgKey}`)
    .data(cityStats)
    .enter()
    .append('text')
    .attr('class', svgKey)
    .text(d => {
      const ioName = `(↑${d.exportVolume} ↓${d.importVolume})`;
      return d.isWest ? `${ioName} ${d.name}` : `${d.name} ${ioName}`;
    })
    .attr('x', d => cityPositions.get(d.name).x)
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
  state: STRChartState
) => {
  if (state.curveDistance === 0) {
    cityStats.forEach((c, i) => {
      cityPositions.set(c.name, {
        x: isWest ? state.offsets[0] : state.offsets[0] + state.gapDistance,
        y: state.offsets[1] + (i / cityStats.length) * state.height
      });
    });
    return;
  }

  const beta = Math.atan(state.height / 2 / state.curveDistance);
  const alpha = Math.PI - 2 * beta;
  const radius =
    Math.sqrt(
      Math.pow(state.curveDistance, 2) + Math.pow(state.height / 2, 2)
    ) /
    (Math.sin(alpha / 2) * 2);

  const scaleToCircle = d3
    .scaleLinear()
    .domain([0, cityStats.filter(n => n.isWest === isWest).length])
    .range(isWest ? [Math.PI - alpha, Math.PI + alpha] : [-alpha, alpha]);
  cityStats.forEach((c, i) => {
    const value = scaleToCircle(
      isWest ? cityStats.length - (i + 0.5) : i + 0.5
    );
    const pos = calculateCirclePos(
      value,
      radius,
      isWest
        ? radius + state.offsets[0]
        : -radius +
          state.offsets[0] +
          state.curveDistance * 2 +
          state.gapDistance,
      state.height / 2 + state.offsets[1]
    );
    cityPositions.set(c.name, pos);
  });
};
