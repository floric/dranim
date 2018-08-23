import { Colors } from '@masterthesis/shared';
import { Spec } from 'vega-lib';
import { VegaChart } from './Vega';

export const PieChart: VegaChart = {
  properties: [
    {
      name: 'innerRadius',
      label: 'Inner Radius',
      default: 0
    }
  ],
  render: (
    data: Array<{ label: string; value: number }>,
    properties: { innerRadius: number }
  ): Spec => ({
    $schema: 'https://vega.github.io/schema/vega/v4.json',
    autosize: 'none',
    signals: [{ name: 'innerRadius', value: properties.innerRadius }],
    data: [
      {
        name: 'values',
        values: data.map(n => ({ id: n.label, field: n.value })),
        transform: [
          {
            type: 'pie',
            field: 'field',
            startAngle: 0,
            endAngle: Math.PI * 2,
            padAngle: 0,
            sort: false
          }
        ]
      }
    ],
    legends: [
      {
        fill: 'color',
        orient: 'top-right',
        encode: {
          labels: {
            enter: {
              fontSize: { value: 12 },
              fill: { value: Colors.Black }
            }
          },
          symbols: {
            enter: {
              stroke: { value: 'transparent' }
            }
          }
        }
      }
    ],
    scales: [
      {
        name: 'color',
        type: 'ordinal',
        range: { scheme: 'category20' }
      }
    ],
    marks: [
      {
        type: 'arc',
        from: { data: 'values' },
        encode: {
          enter: {
            fill: { scale: 'color', field: 'id' },
            x: { field: { group: 'width' }, mult: 0.5 },
            y: { field: { group: 'height' }, mult: 0.5 }
          },
          update: {
            startAngle: { field: 'startAngle' },
            endAngle: { field: 'endAngle' },
            padAngle: { field: 'padAngle' },
            outerRadius: { signal: 'width / 2 * 0.75' },
            cornerRadius: { value: 0 },
            innerRadius: { signal: 'innerRadius' }
          }
        }
      },
      {
        type: 'text',
        from: { data: 'values' },
        encode: {
          enter: {
            x: { field: { group: 'width' }, mult: 0.5 },
            y: { field: { group: 'height' }, mult: 0.5 },
            radius: { signal: '(width / 2 * 0.75 + innerRadius) / 2' },
            theta: { signal: '(datum.startAngle + datum.endAngle)/2' },
            fill: { value: Colors.Black },
            align: { value: 'center' },
            baseline: { value: 'middle' },
            text: { field: 'field' }
          }
        }
      }
    ]
  })
};
