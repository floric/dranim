import * as React from 'react';

import { LinearChartType } from '@masterthesis/shared';

import { BarChart } from './visualizations/BarChart';

export interface CustomDataRendererProps {
  value: any;
}

export const CustomDataRenderer: React.SFC<CustomDataRendererProps> = ({
  value
}) => {
  if (value.type === LinearChartType.BAR) {
    return <BarChart value={value} />;
  }

  return <p>Unsupported custom data: {value.type}</p>;
};
