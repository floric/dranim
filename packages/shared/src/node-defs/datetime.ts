import { NodeDef } from '../nodes';
import { TimeSocket, NumberSocket, DatetimeSocket } from '../sockets';

export interface DatetimeInputNodeOutputs {
  value: Date;
}

export interface DatetimeInputNodeForm {
  value: Date;
}

export const DatetimeInputNodeDef: NodeDef<{}, DatetimeInputNodeOutputs> = {
  name: 'Input',
  type: 'DatetimeInput',
  inputs: {},
  outputs: {
    value: DatetimeSocket('Datetime')
  },
  path: ['Datetime'],
  keywords: []
};

export interface DatetimeConstructNodeInputs {
  day: number;
  month: number;
  year: number;
  time: Date;
}

export const DatetimeConstructNodeDef: NodeDef<
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs
> = {
  name: 'Construct',
  type: 'DatetimeConstruct',
  inputs: {
    day: NumberSocket('Day'),
    month: NumberSocket('Month'),
    year: NumberSocket('Year'),
    time: TimeSocket('Time')
  },
  outputs: {
    value: DatetimeSocket('Datetime')
  },
  path: ['Datetime'],
  keywords: []
};
