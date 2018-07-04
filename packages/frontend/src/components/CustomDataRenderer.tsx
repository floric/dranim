import * as React from 'react';

import { GQLOutputResult, LinearChartType } from '@masterthesis/shared';
import { Button, Card } from 'antd';
import { v4 } from 'uuid';

import { showNotificationWithIcon } from '../utils/form';
import { BarChart } from './visualizations/BarChart';
import { ColumnChart } from './visualizations/ColumnChart';

export interface CustomDataRendererProps {
  value: any;
  result: GQLOutputResult;
}

interface ChartAction {
  name: string;
  icon: string;
  onClick: () => void;
}

export interface ChartRender {
  actions: Array<ChartAction>;
  elem: JSX.Element;
}

export interface SVGChartWithId {
  containerId: string;
}

export const CustomDataRenderer: React.SFC<CustomDataRendererProps> = ({
  value,
  result
}) => {
  let chart: ChartRender | null = null;
  const containerId = `c-${v4()}`;
  if (value.type === LinearChartType.BAR) {
    const elem = <BarChart value={value} containerId={containerId} />;
    chart = {
      elem,
      actions: [exportAsSvgAction(containerId, result)]
    };
  } else if (value.type === LinearChartType.COLUMN) {
    chart = {
      elem: <ColumnChart value={value} containerId={containerId} />,
      actions: [exportAsSvgAction(containerId, result)]
    };
  }

  if (chart) {
    return (
      <Card
        title={result.name}
        bordered={false}
        extra={
          <>
            {chart.actions.map(a => (
              <Button
                icon="download"
                key={`${a.name}-${result.name}`}
                size="small"
                onClick={a.onClick}
              >
                {a.name}
              </Button>
            ))}
          </>
        }
      >
        {chart.elem}
        <Card.Meta description="This is the description" />
      </Card>
    );
  }

  return <p>Unsupported custom data: {value.type}</p>;
};

const exportAsSvgAction = (
  containerId: string,
  result: GQLOutputResult
): ChartAction => ({
  name: 'SVG',
  icon: 'download',
  onClick: () => {
    try {
      const svgData = document.getElementById(containerId).outerHTML;
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${result.name}-${result.id}.svg`;
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
  }
});
