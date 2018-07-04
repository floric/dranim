import * as React from 'react';

import { VisBarChartType } from '@masterthesis/shared';

import { BarChart } from './visualizations/BarChart';

export interface CustomDataRendererProps {
  value: any;
}

export const CustomDataRenderer: React.SFC<CustomDataRendererProps> = ({
  value
}) => {
  if (value.type === VisBarChartType.BAR) {
    return <BarChart value={value} />;
  }

  return <p>Unsupported custom data: {value.type}</p>;
};
