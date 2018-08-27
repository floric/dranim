import { GQLOutputResult } from '@masterthesis/shared';
import { Col, Row } from 'antd';
import * as React from 'react';
import { v4 } from 'uuid';
import { parse, Spec, View } from 'vega';

import { showNotificationWithIcon } from '../../utils/form';
import { LoadingCard } from '../CustomCards';
import { NumericProperty } from '../properties/NumericProperty';
import { SelectProperty } from '../properties/SelectProperty';
import { VisCard } from './VisCard';

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

export interface VegaProps {
  content: VegaChart;
  result: GQLOutputResult;
  width: number;
  height: number;
  value: any;
}

export interface VegaState {
  properties: {};
  containerId: string;
  view: View | null;
}

const propertiesToObj = (properties: InputProperties) => {
  const res = {};

  properties.forEach(p => {
    res[p.name] = p.default;
  });

  return res;
};

export const downloadFromUrl = (url: string, fileName: string) => {
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export class Vega extends React.Component<VegaProps, VegaState> {
  public state: VegaState = {
    properties: propertiesToObj(this.props.content.properties),
    containerId: `c-${v4()}`,
    view: null
  };

  public async updateView() {
    const { content, width, height, value } = this.props;
    const { containerId, properties } = this.state;
    const view = new View(
      parse({ width, height, ...content.render(value, properties) })
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
    const { view, containerId } = this.state;
    if (!view) {
      return <LoadingCard text={result.name} />;
    }

    return (
      <VisCard
        result={result}
        downloadOptions={[
          { name: 'SVG', icon: 'code', onClick: this.handleDownloadSvg },
          { name: 'PNG', icon: 'picture', onClick: this.handleDownloadPng }
        ]}
        properties={
          properties.length > 0 ? (
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
          ) : null
        }
      >
        <div id={containerId} />
      </VisCard>
    );
  }
}
