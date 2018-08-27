import * as React from 'react';

import {
  DataType,
  GQLOutputResult,
  LinearChartType,
  SoundChartDef
} from '@masterthesis/shared';
import ContainerDimensions from 'react-container-dimensions';

import { BooleanInfo } from './BooleanInfo';
import { NumberInfo } from './NumberInfo';
import { StringInfo } from './StringInfo';
import { BarChart } from './visualizations/BarChart';
import { ColumnChart } from './visualizations/ColumnChart';
import { PieChart } from './visualizations/PieChart';
import { STRChart } from './visualizations/STRChart';
import { Vega } from './visualizations/Vega';
import { VisCard } from './visualizations/VisCard';

export interface VisRenderer {
  result: GQLOutputResult;
}

export interface ChartRender {
  elem: JSX.Element;
}

const CARD_PADDING = 24;

export const VisRenderer: React.SFC<VisRenderer> = ({ result }) => {
  const value = JSON.parse(result.value);

  if (result.type !== DataType.VIS) {
    return (
      <VisCard result={result}>
        {(() => {
          if (result.type === DataType.NUMBER) {
            return <NumberInfo total={value} />;
          } else if (result.type === DataType.STRING) {
            return <StringInfo value={value} />;
          } else if (result.type === DataType.BOOLEAN) {
            return <BooleanInfo value={value} />;
          }

          return <p>Unsupported Datatype!</p>;
        })()}
      </VisCard>
    );
  }

  if (value.type === LinearChartType.BAR) {
    return (
      <ContainerDimensions>
        {({ width }) => (
          <Vega
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={BarChart}
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === LinearChartType.COLUMN) {
    return (
      <ContainerDimensions>
        {({ width }) => (
          <Vega
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={ColumnChart}
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === LinearChartType.PIE) {
    return (
      <ContainerDimensions>
        {({ width }) => (
          <Vega
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={PieChart}
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === SoundChartDef.type) {
    return (
      <ContainerDimensions>
        {({ width }) => (
          <STRChart
            result={result}
            value={value}
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
          />
        )}
      </ContainerDimensions>
    );
  }

  return <p>Unsupported custom data: {value.type}</p>;
};
