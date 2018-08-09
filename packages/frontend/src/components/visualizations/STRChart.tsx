import * as React from 'react';

import { Col, Divider, Icon, Input, Row, Slider, Tag } from 'antd';

import { SVGChartWithId } from '../CustomDataRenderer';
import { SliderCol } from '../properties/Slider';
import { renderSTRChart } from './str-svg';

export interface STRChartProps extends SVGChartWithId {
  value: any;
}

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;
export const TEXT_OFFSET = 5;
export const SOUND_BAR_OFFSET = 15;
const MINIMUM_OPACITY = 0.15;
const WEST_PASSAGE_COLOR = '#FAAB43';
const EAST_PASSAGE_COLOR = '#003E61';
const GAP_DIST_DEFAULT = 200;
const GAP_DIST_MAX = CANVAS_WIDTH;
const HEIGHT_DEFAULT = 500;
const HEIGHT_MAX = 1000;
const HEIGHT_MIN = 100;
const CURVE_DEFAULT = 120;
const CURVE_MAX = 500;
const OFFSET_MAX = 1000;

export interface STRChartState {
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
        inputValue: ''
      }
    });
  }

  public componentDidMount() {
    this.renderChart();
  }

  private renderChart() {
    const { value, containerId } = this.props;
    if (!value.values) {
      throw new Error('Unsupported value');
    }

    renderSTRChart(
      containerId,
      value.values.cities,
      value.values.passages,
      this.state
    );
  }

  private handleClose = removedTag => {
    const soundNames = this.state.soundNames.filter(tag => tag !== removedTag);
    this.setState({ soundNames }, this.renderChart);
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
    this.setState(
      {
        soundNames: newSoundNames,
        temp: {
          ...this.state.temp,
          inputVisible: false,
          inputValue: ''
        }
      },
      this.renderChart
    );
  };

  private handleChangeWithRerendering = (newState: Pick<STRChartState, any>) =>
    this.setState(newState, this.renderChart);
  private handleChangeGap = (val: number) =>
    this.handleChangeWithRerendering({ gapDistance: val });
  private handleChangeHeight = (val: number) =>
    this.handleChangeWithRerendering({ height: val });
  private handleChangeCurveDistance = (val: number) =>
    this.handleChangeWithRerendering({ curveDistance: val });
  private handleChangeOffsetX = (val: number) =>
    this.handleChangeWithRerendering({ offsets: [this.state.offsets[0], val] });
  private handleChangeOffsetY = (val: number) =>
    this.handleChangeWithRerendering({ offsets: [val, this.state.offsets[1]] });
  private handleChangeMinOpacity = (val: number) =>
    this.handleChangeWithRerendering({
      colors: {
        ...this.state.colors,
        minTextOpacity: val
      }
    });
  private handleChangePassageColorEast = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) =>
    this.handleChangeWithRerendering({
      colors: {
        ...this.state.colors,
        eastPassage: ev.target.value
      }
    });
  private handleChangePassageColorWest = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) =>
    this.handleChangeWithRerendering({
      colors: {
        ...this.state.colors,
        westPassage: ev.target.value
      }
    });

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
              onChange={this.handleChangeGap}
            />
          </Col>
          <SliderCol
            label="Height"
            min={HEIGHT_MIN}
            max={HEIGHT_MAX}
            value={this.state.height}
            onChange={this.handleChangeHeight}
          />
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Curviness</p>
            <Slider
              min={0}
              max={CURVE_MAX}
              defaultValue={this.state.curveDistance}
              onChange={this.handleChangeCurveDistance}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Offset Y</p>
            <Slider
              min={0}
              max={OFFSET_MAX}
              defaultValue={this.state.offsets[0]}
              onChange={this.handleChangeOffsetX}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Offset X</p>
            <Slider
              min={0}
              max={OFFSET_MAX}
              defaultValue={this.state.offsets[1]}
              onChange={this.handleChangeOffsetY}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <p>Minimal Opacity</p>
            <Slider
              min={0}
              max={1}
              step={0.01}
              defaultValue={this.state.colors.minTextOpacity}
              onChange={this.handleChangeMinOpacity}
            />
          </Col>
          <Col sm={24} md={12} lg={6}>
            <p>Colors</p>
            <Input.Group compact>
              <Input
                onChange={this.handleChangePassageColorEast}
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
                onChange={this.handleChangePassageColorWest}
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
        <Divider style={{ marginTop: 8, marginBottom: 8 }} />
        <div id={this.props.containerId} />
      </>
    );
  }
}
