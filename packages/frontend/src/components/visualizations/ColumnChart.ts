import { Colors } from '@masterthesis/shared';
import { Spec } from 'vega-lib';
import { VegaChart } from './Vega';

export const ColumnChart: VegaChart = {
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
        name: 'yscale',
        type: 'band',
        domain: { data: 'table', field: 'label' },
        range: {
          signal: 'innerRadius'
        },
        padding: 0.05,
        round: true
      },
      {
        name: 'xscale',
        domain: { data: 'table', field: 'value' },
        nice: true,
        range: 'width'
      }
    ],
    axes: [
      { orient: 'bottom', scale: 'xscale' },
      { orient: 'left', scale: 'yscale' }
    ],
    marks: [
      {
        type: 'rect',
        from: { data: 'table' },
        encode: {
          enter: {
            y: { scale: 'yscale', field: 'label' },
            height: { scale: 'yscale', band: 1 },
            x: { scale: 'xscale', field: 'value' },
            x2: { scale: 'xscale', value: 0 },
            fill: { value: Colors.VisDefault }
          }
        }
      },
      {
        type: 'text',
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
