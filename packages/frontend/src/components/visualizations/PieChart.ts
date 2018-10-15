import { Colors } from '@masterthesis/shared';
import { LegendOrient, Spec } from 'vega-lib';
import { InputPropertyType, VegaChart } from './VegaCard';

export const PieChart: VegaChart = {
  properties: [
    {
      name: 'innerRadius',
      label: 'Donut',
      default: 0,
      type: InputPropertyType.NUMBER,
      unit: '%'
    },
    {
      name: 'scale',
      label: 'Scale',
      default: 80,
      type: InputPropertyType.NUMBER,
      unit: '%'
    },
    {
      name: 'legendPos',
      label: 'Legend',
      default: 'bottom-left',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'none'],
      type: InputPropertyType.STRING
    }
  ],
  render: (
    data: Array<{ label: string; value: number }>,
    properties: { innerRadius: number; scale: number; legendPos: LegendOrient }
  ): Spec => ({
    $schema: 'https://vega.github.io/schema/vega/v4.json',
    autosize: 'none',
    signals: [
      { name: 'innerRadius', value: properties.innerRadius },
      { name: 'scale', value: properties.scale }
    ],
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
    legends:
      properties.legendPos !== 'none'
        ? [
            {
              fill: 'color',
              orient: properties.legendPos,
              direction: 'horizontal',
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
          ]
        : [],
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
            fill: { scale: 'color', field: 'field' },
            x: { field: { group: 'width' }, mult: 0.5 },
            y: { field: { group: 'height' }, mult: 0.5 }
          },
          update: {
            startAngle: { field: 'startAngle' },
            endAngle: { field: 'endAngle' },
            padAngle: { field: 'padAngle' },
            outerRadius: { signal: 'width * scale / 200' },
            cornerRadius: { value: 0 },
            innerRadius: { signal: 'width * scale * innerRadius / 20000' }
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
            radius: {
              signal: '(width / 2 * (1 + innerRadius / 100)) * scale / 200'
            },
            theta: { signal: '(datum.startAngle + datum.endAngle)/2' },
            fill: { value: Colors.Black },
            align: { value: 'center' },
            baseline: { value: 'middle' },
            text: { field: 'id' }
          }
        }
      }
    ]
  })
};
