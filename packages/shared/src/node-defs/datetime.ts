import { NodeDef } from '../nodes';
import { BooleanSocket, DatetimeSocket, NumberSocket } from '../sockets';

export interface DatetimeInputNodeOutputs {
  value: Date;
}

export interface DatetimeInputNodeForm {
  value: string;
}

export const DatetimeInputNodeDef: NodeDef<{}, DatetimeInputNodeOutputs> = {
  name: 'Input Date',
  type: 'DatetimeInput',
  inputs: {},
  outputs: {
    value: DatetimeSocket('Date')
  },
  path: ['Date'],
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
  name: 'Construct Date',
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
    value: DatetimeSocket('Date')
  },
  path: ['Date', 'Converters'],
  keywords: []
};

export const DatetimeSplitNodeDef: NodeDef<
  DatetimeInputNodeOutputs,
  DatetimeConstructNodeInputs
> = {
  name: 'Split Date',
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
    value: DatetimeSocket('Date')
  },
  path: ['Date', 'Converters'],
  keywords: []
};

export interface DatetimeCompareNodeInputs {
  a: Date;
  b: Date;
}

export interface DatetimeCompareNodeOutputs {
  value: boolean;
}

export enum TimeComparisonType {
  EARLIER_THAN = 'EARLIER_THAN',
  LATER_THAN = 'LATER_THAN',
  EQUALS = 'EQUALS'
}

export interface TimeComparisonNodeForm {
  type: TimeComparisonType;
}

export const DatetimeCompareNodeDef: NodeDef<
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs
> = {
  name: 'Compare Dates',
  type: 'DatetimeCompare',
  inputs: {
    a: DatetimeSocket('Date A'),
    b: DatetimeSocket('Date B')
  },
  outputs: {
    value: BooleanSocket('A compared to B')
  },
  path: ['Date', 'Operators'],
  keywords: ['time compare', 'earlier', 'later']
};
