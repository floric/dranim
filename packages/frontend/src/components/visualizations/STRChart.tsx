import { GQLOutputResult } from '@masterthesis/shared';
import { Col, Icon, Input, Row, Tag } from 'antd';
import * as React from 'react';
import { v4 } from 'uuid';

import { showNotificationWithIcon } from '../../utils/form';
import { NumericProperty } from '../properties/NumericProperty';
import { SliderCol } from '../properties/Slider';
import { renderSTRChart } from './str-svg';
import { downloadFromUrl } from './Vega';
import { VisCard } from './VisCard';

export const TEXT_OFFSET = 5;
export const SOUND_BAR_OFFSET = 15;
const MINIMUM_OPACITY = 0.15;
const WEST_PASSAGE_COLOR = '#FAAB43';
const EAST_PASSAGE_COLOR = '#003E61';
const GAP_DIST_DEFAULT = 0.7;
const HEIGHT_DEFAULT = 0.8;
const CURVE_DEFAULT = 0.2;
const OFFSETS_DEFAULT: [number, number] = [0.5, 0.6];

export interface STRChartProps {
  value: any;
  result: GQLOutputResult;
  width: number;
  height: number;
}

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
  container: {
    width: number;
    height: number;
    id: string;
  };
  soundNames: Array<string>;
}

export class STRChart extends React.Component<STRChartProps, STRChartState> {
  private canvasContainer: React.RefObject<HTMLDivElement> = React.createRef<
    HTMLDivElement
  >();

  public state: STRChartState = {
    gapDistance: GAP_DIST_DEFAULT,
    height: HEIGHT_DEFAULT,
    curveDistance: CURVE_DEFAULT,
    offsets: OFFSETS_DEFAULT,
    colors: {
      minTextOpacity: MINIMUM_OPACITY,
      eastPassage: EAST_PASSAGE_COLOR,
      westPassage: WEST_PASSAGE_COLOR
    },
    soundNames: [],
    container: {
      width: this.props.width,
      height: this.props.height,
      id: `c-${v4()}`
    },
    temp: {
      inputVisible: false,
      inputValue: ''
    }
  };

  public componentDidMount() {
    this.renderChart();
  }

  private renderChart() {
    const { value, width, height } = this.props;
    if (!value.values) {
      throw new Error('Unsupported value');
    }

    renderSTRChart(
      this.state.container.id,
      value.values.cities,
      value.values.passages,
      this.state,
      width,
      height
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

  private handleDownloadSvg = async () => {
    try {
      const svgData = this.canvasContainer.current.innerHTML;
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      downloadFromUrl(svgUrl, 'download.svg');
    } catch (err) {
      showNotificationWithIcon({
        title: 'SVG Export failed',
        content: 'The SVG Export has failed because of an unknown reason.',
        icon: 'error'
      });
    }
  };
  public render() {
    const {
      temp: { inputVisible, inputValue },
      soundNames,
      container: { id },
      colors,
      gapDistance,
      height,
      curveDistance,
      offsets
    } = this.state;
    const { result } = this.props;
    return (
      <VisCard
        result={result}
        downloadOptions={[
          { name: 'SVG', icon: 'code', onClick: this.handleDownloadSvg }
        ]}
        properties={
          <Row gutter={8}>
            {[
              {
                text: 'Width',
                onChange: this.handleChangeGap,
                defaultValue: gapDistance
              },
              {
                text: 'Height',
                onChange: this.handleChangeHeight,
                defaultValue: height
              },
              {
                text: 'Curviness',
                onChange: this.handleChangeCurveDistance,
                defaultValue: curveDistance
              },
              {
                text: 'X Offset',
                onChange: this.handleChangeOffsetX,
                defaultValue: offsets[0]
              },
              {
                text: 'Y Offset',
                onChange: this.handleChangeOffsetY,
                defaultValue: offsets[1]
              },
              {
                text: 'Min Opacity',
                onChange: this.handleChangeMinOpacity,
                defaultValue: colors.minTextOpacity
              }
            ].map(({ defaultValue, onChange, text }) => (
              <Col md={24} lg={12} key={`prop-${text}`}>
                <NumericProperty
                  text={text}
                  onChange={onChange}
                  defaultValue={defaultValue}
                />
              </Col>
            ))}
            <Col sm={24} lg={12}>
              <p>Colors</p>
              <Input.Group compact>
                <Input
                  onChange={this.handleChangePassageColorEast}
                  value={colors.eastPassage}
                  prefix={
                    <Icon
                      style={{ color: colors.eastPassage }}
                      type="arrow-right"
                    />
                  }
                  style={{ width: '50%' }}
                />
                <Input
                  value={colors.westPassage}
                  onChange={this.handleChangePassageColorWest}
                  prefix={
                    <Icon
                      style={{ color: colors.westPassage }}
                      type="arrow-left"
                    />
                  }
                  style={{
                    width: '50%',
                    color: colors.westPassage,
                    backgroundColor: colors.westPassage
                  }}
                />
              </Input.Group>
            </Col>
            <Col sm={24} lg={12}>
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
        }
      >
        <div id={id} ref={this.canvasContainer} />
      </VisCard>
    );
  }
}
