import { Colors } from '@masterthesis/shared';
import { Spec } from 'vega-lib';
import { VegaChart } from './VegaCard';

export const BarChart: VegaChart = {
  properties: [],
  render: (
    data: Array<{ label: string; value: number }>,
    properties: {}
  ): Spec => ({
    $schema: 'https://vega.github.io/schema/vega/v4.json',
    data: [
      {
        name: 'table',
        values: data
      }
    ],
    scales: [
      {
        name: 'xscale',
        type: 'band',
        domain: { data: 'table', field: 'label' },
        range: 'width',
        padding: 0.05,
        round: true
      },
      {
        name: 'yscale',
        domain: { data: 'table', field: 'value' },
        nice: true,
        range: 'height'
      }
    ],
    axes: [
      { orient: 'bottom', scale: 'xscale' },
      { orient: 'left', scale: 'yscale' }
    ],
    marks: [
      {
        type: 'rect',
        sort: { field: 'value', order: 'ascending' },
        from: { data: 'table' },
        encode: {
          enter: {
            x: {
              scale: 'xscale',
              field: 'label'
            },
            width: { scale: 'xscale', band: 1 },
            y: { scale: 'yscale', field: 'value' },
            y2: { scale: 'yscale', value: 0 },
            fill: { value: Colors.VisDefault }
          }
        }
      },
      {
        type: 'text',
        sort: { field: 'value', order: 'ascending' },
        encode: {
          enter: {
            align: { value: 'center' },
            baseline: { value: 'bottom' },
            fill: { value: Colors.GrayDark }
          }
        }
      }
    ]
  })
};
