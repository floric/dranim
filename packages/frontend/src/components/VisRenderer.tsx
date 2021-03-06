import React, { SFC } from 'react';

import {
  Dataset,
  DataType,
  GQLOutputResult,
  LinearChartType,
  SoundChartDef
} from '@masterthesis/shared';
import ContainerDimensions from 'react-container-dimensions';
import { Link } from 'react-router-dom';

import { BooleanInfo } from './infos/BooleanInfo';
import { NumberInfo } from './infos/NumberInfo';
import { StringInfo } from './infos/StringInfo';
import { BarChart } from './visualizations/BarChart';
import { ColumnChart } from './visualizations/ColumnChart';
import { PieChart } from './visualizations/PieChart';
import { STRChartCard } from './visualizations/STRChartCard';
import { VegaCard } from './visualizations/VegaCard';
import { VisCard } from './visualizations/VisCard';

export interface PublicComponent {
  visibility?: 'public' | 'private';
}

export interface VisRendererProps extends PublicComponent {
  result: GQLOutputResult;
}

export interface ChartRender {
  elem: JSX.Element;
}

const CARD_PADDING = 24;

export const VisRenderer: SFC<VisRendererProps> = ({
  result,
  visibility = 'public',
  result: { value }
}) => {
  if (result.type === DataType.VIS) {
    return (
      <Visualizations visibility={visibility} result={result} value={value} />
    );
  }

  return <Infos visibility={visibility} result={result} value={value} />;
};

const Infos: SFC<{ result: GQLOutputResult; value: any } & PublicComponent> = ({
  result,
  visibility,
  value
}) => (
  <VisCard result={result} visibility={visibility}>
    {(() => {
      if (result.type === DataType.NUMBER) {
        return <NumberInfo total={value} />;
      } else if (result.type === DataType.STRING) {
        return <StringInfo value={value} />;
      } else if (result.type === DataType.BOOLEAN) {
        return <BooleanInfo value={value} />;
      } else if (result.type === DataType.DATASET) {
        const ds: Dataset = value;
        return (
          <p>
            <Link to={`/data/${ds.id}`}>
              Table <strong>{ds.name}</strong>
            </Link>{' '}
            created successfully
          </p>
        );
      }

      return <p>Unsupported Datatype!</p>;
    })()}
  </VisCard>
);

const Visualizations: SFC<
  { result: GQLOutputResult; value: any } & PublicComponent
> = ({ result, visibility, value }) => {
  if (
    value.type === LinearChartType.BAR ||
    value.type === LinearChartType.COLUMN ||
    value.type === LinearChartType.PIE
  ) {
    return (
      <ContainerDimensions>
        {({ width }) => (
          <VegaCard
            visibility={visibility}
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
            result={result}
            value={value.values}
            content={
              value.type === LinearChartType.PIE
                ? PieChart
                : value.type === LinearChartType.COLUMN
                  ? ColumnChart
                  : BarChart
            }
          />
        )}
      </ContainerDimensions>
    );
  } else if (value.type === SoundChartDef.type) {
    return (
      <ContainerDimensions>
        {({ width }) => (
          <STRChartCard
            visibility={visibility}
            result={result}
            value={value}
            width={width - 2 * CARD_PADDING}
            height={width - 2 * CARD_PADDING}
          />
        )}
      </ContainerDimensions>
    );
  }

  return <p>Unsupported visualization type</p>;
};
