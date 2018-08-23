import * as React from 'react';

import {
  GQLOutputResult,
  LinearChartType,
  SoundChartDef
} from '@masterthesis/shared';
import ContainerDimensions from 'react-container-dimensions';
import { v4 } from 'uuid';

import { BarChart } from './visualizations/BarChart';
import { ColumnChart } from './visualizations/ColumnChart';
import { PieChart } from './visualizations/PieChart';
import { STRChart } from './visualizations/STRChart';
import { Vega } from './visualizations/Vega';

export interface CustomDataRendererProps {
  value: any;
  result: GQLOutputResult;
}

export interface ChartRender {
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
      elem
    };
  } else if (value.type === LinearChartType.COLUMN) {
    chart = {
      elem: <ColumnChart value={value} containerId={containerId} />
    };
  } else if (value.type === LinearChartType.PIE) {
    chart = {
      elem: (
        <ContainerDimensions>
          {({ width }) => (
            <Vega
              width={width}
              height={width}
              result={result}
              value={value.values}
              content={PieChart}
              containerId={containerId}
            />
          )}
        </ContainerDimensions>
      )
    };
  } else if (value.type === SoundChartDef.type) {
    chart = {
      elem: <STRChart value={value} containerId={containerId} />
    };
  }

  if (chart) {
    return chart.elem;
  }

  return <p>Unsupported custom data: {value.type}</p>;
};
