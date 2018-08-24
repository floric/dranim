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

const CARD_PADDING = 24;

export const CustomDataRenderer: React.SFC<CustomDataRendererProps> = ({
  value,
  result
}) => {
  let chart: JSX.Element | null = null;
  const containerId = `c-${v4()}`;
  if (value.type === LinearChartType.BAR) {
    chart = (
      <ContainerDimensions>
        {({ width }) => (
          <Vega
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={BarChart}
            containerId={containerId}
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === LinearChartType.COLUMN) {
    chart = (
      <ContainerDimensions>
        {({ width }) => (
          <Vega
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={ColumnChart}
            containerId={containerId}
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === LinearChartType.PIE) {
    chart = (
      <ContainerDimensions>
        {({ width }) => (
          <Vega
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={PieChart}
            containerId={containerId}
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === SoundChartDef.type) {
    chart = <STRChart value={value} containerId={containerId} />;
  }

  if (chart) {
    return chart;
  }

  return <p>Unsupported custom data: {value.type}</p>;
};
