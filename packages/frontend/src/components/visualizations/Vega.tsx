import { GQLOutputResult } from '@masterthesis/shared';
import { Button, Card, Divider } from 'antd';
import * as React from 'react';
import { parse, Spec, View } from 'vega';
import { showNotificationWithIcon } from '../../utils/form';
import { SVGChartWithId } from '../CustomDataRenderer';
import { NumericProperty } from '../properties/NumericProperty';

export interface VegaChart {
  render: (data: any, properties: { [name: string]: number }) => Spec;
  properties: InputProperties;
}

export type InputProperties = [
  { name: string; label: string; default: number; unit?: string }
];

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
    this.setState({ view });
  }

  public componentDidUpdate(newProps: VegaProps) {
    if (newProps !== this.props) {
      this.updateView();
    }
  }

  private handleDownloadSvg = async () => {
    try {
      const svgData = await this.state.view.toSVG();
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `download.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
      result,
      content: { properties }
    } = this.props;
    const { showProperties } = this.state;
    return (
      <Card
        title={result.name}
        bordered={false}
        bodyStyle={{ padding: 0 }}
        extra={
          <>
            <Button
              size="small"
              icon="setting"
              onClick={() => this.setState({ showProperties: !showProperties })}
            >
              {showProperties ? 'Close Properties' : 'Show Properties'}
            </Button>
            <Button
              icon="download"
              size="small"
              onClick={this.handleDownloadSvg}
            >
              SVG
            </Button>
          </>
        }
      >
        {showProperties && (
          <>
            {properties.map(n => (
              <NumericProperty
                key={`property-${n.name}`}
                text={n.label}
                unit={n.unit}
                defaultValue={n.default}
                onChange={val =>
                  this.setState(
                    { properties: { [n.name]: val } },
                    this.updateView
                  )
                }
              />
            ))}
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
