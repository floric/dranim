import { GQLOutputResult } from '@masterthesis/shared';
import { Button, Card, Col, Divider, Dropdown, Icon, Menu, Row } from 'antd';
import * as React from 'react';
import { parse, Spec, View } from 'vega';
import { showNotificationWithIcon } from '../../utils/form';
import { LoadingCard } from '../CustomCards';
import { SVGChartWithId } from '../CustomDataRenderer';
import { NumericProperty } from '../properties/NumericProperty';
import { SelectProperty } from '../properties/SelectProperty';

export interface VegaChart {
  render: (data: any, properties: { [name: string]: number | string }) => Spec;
  properties: InputProperties;
}

export enum InputPropertyType {
  NUMBER = 'Number',
  STRING = 'String'
}

export interface InputProperty<T = any> {
  name: string;
  label: string;
  default: T;
  type: InputPropertyType;
  options?: Array<T>;
  unit?: string;
}

export type InputProperties = Array<InputProperty>;

export interface VegaProps extends SVGChartWithId {
  content: VegaChart;
  result: GQLOutputResult;
  width: number;
  height: number;
  value: any;
}

export interface VegaState {
  showProperties: boolean;
  properties: {};
  view: View | null;
}

const propertiesToObj = (properties: InputProperties) => {
  const res = {};

  properties.forEach(p => {
    res[p.name] = p.default;
  });

  return res;
};

const downloadFromUrl = (url: string, fileName: string) => {
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export class Vega extends React.Component<VegaProps, VegaState> {
  public state: VegaState = {
    showProperties: false,
    properties: propertiesToObj(this.props.content.properties),
    view: null
  };

  public async updateView() {
    const { containerId, content, width, height, value } = this.props;
    const view = new View(
      parse({ width, height, ...content.render(value, this.state.properties) })
    )
      .renderer('svg')
      .initialize(`#${containerId}`)
      .hover()
      .run();
    await this.setState({ view });
  }

  public componentDidUpdate() {
    this.updateView();
  }

  public shouldComponentUpdate(nextProps: VegaProps, nextState: VegaState) {
    return (
      nextProps !== this.props ||
      nextState.properties !== this.state.properties ||
      nextState.showProperties !== this.state.showProperties ||
      (this.state.view === null && nextState.view !== null)
    );
  }

  private handleDownloadPng = async () => {
    try {
      const url = await this.state.view.toImageURL('png', 4);
      downloadFromUrl(url, 'download.png');
    } catch (err) {
      showNotificationWithIcon({
        title: 'PNG Export failed',
        content: 'The PNG Export has failed because of an unknown reason.',
        icon: 'error'
      });
    }
  };

  private handleDownloadSvg = async () => {
    try {
      const svgData = await this.state.view.toSVG();
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

  private toggleProperties = () =>
    this.setState({ showProperties: !this.state.showProperties });

  private handleChangedProperties = (val: number | string, n: InputProperty) =>
    this.setState(
      { properties: { ...this.state.properties, [n.name]: val } },
      this.updateView
    );

  public render() {
    const {
      result,
      content: { properties }
    } = this.props;
    const { showProperties, view } = this.state;
    if (!view) {
      return <LoadingCard text={result.name} />;
    }

    const menu = (
      <Menu
        onClick={a => {
          if (a.key === 'svg') {
            this.handleDownloadSvg();
          } else if (a.key === 'png') {
            this.handleDownloadPng();
          }
        }}
      >
        <Menu.Item key="svg">
          <Icon type="picture" />
          PNG
        </Menu.Item>
        <Menu.Item key="png">
          <Icon type="code" />
          SVG
        </Menu.Item>
      </Menu>
    );

    return (
      <Card
        title={result.name}
        bordered={false}
        extra={
          <Button.Group size="small">
            {properties.length > 0 && (
              <Button
                icon={showProperties ? 'up' : 'down'}
                onClick={this.toggleProperties}
              >
                Properties
              </Button>
            )}
            <Dropdown overlay={menu}>
              <Button>
                Download <Icon type="download" />
              </Button>
            </Dropdown>
          </Button.Group>
        }
      >
        {showProperties && (
          <>
            <Row gutter={8}>
              {properties.map(n => (
                <Col md={24} lg={12} key={`property-${n.name}`}>
                  {n.type === InputPropertyType.NUMBER ? (
                    <NumericProperty
                      text={n.label}
                      unit={n.unit}
                      defaultValue={n.default}
                      onChange={val => this.handleChangedProperties(val, n)}
                    />
                  ) : (
                    <SelectProperty
                      options={n.options || []}
                      defaultValue={n.default}
                      text={n.label}
                      onChange={val => {
                        this.handleChangedProperties(val, n);
                      }}
                    />
                  )}
                </Col>
              ))}
            </Row>
            <Divider style={{ marginTop: 8, marginBottom: 8 }} />
          </>
        )}
        <div id={this.props.containerId} />{' '}
        {!!result.description && (
          <>
            <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            <Card.Meta description={result.description} />
          </>
        )}
      </Card>
    );
  }
}
