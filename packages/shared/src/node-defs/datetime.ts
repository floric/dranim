import { Moment } from 'moment';

import { NodeDef } from '../nodes';
import { DatetimeSocket, NumberSocket } from '../sockets';

export interface DatetimeInputNodeOutputs {
  value: Moment;
}

export interface DatetimeInputNodeForm {
  value: Moment;
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
  hours: number;
  minutes: number;
  seconds: number;
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
    hours: NumberSocket('Hours'),
    minutes: NumberSocket('Minutes'),
    seconds: NumberSocket('Seconds')
  },
  outputs: {
    value: DatetimeSocket('Datetime')
  },
  path: ['Datetime', 'Converters'],
  keywords: []
};

export const DatetimeSplitNodeDef: NodeDef<
  DatetimeInputNodeOutputs,
  DatetimeConstructNodeInputs
> = {
  name: 'Split',
  type: 'DatetimeSplit',
  outputs: {
    day: NumberSocket('Day'),
    month: NumberSocket('Month'),
    year: NumberSocket('Year'),
    hours: NumberSocket('Hours'),
    minutes: NumberSocket('Minutes'),
    seconds: NumberSocket('Seconds')
  },
  inputs: {
    value: DatetimeSocket('Datetime')
  },
  path: ['Datetime', 'Converters'],
  keywords: []
};
