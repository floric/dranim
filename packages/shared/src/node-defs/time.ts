import { NodeDef } from '../nodes';
import { BooleanSocket, NumberSocket, TimeSocket } from '../sockets';

export interface TimeInputNodeOutputs {
  value: Date;
}

export interface TimeInputNodeForm {
  value: string;
}

export const TimeInputNodeDef: NodeDef<{}, TimeInputNodeOutputs> = {
  name: 'Input',
  type: 'TimeInput',
  inputs: {},
  outputs: {
    value: TimeSocket('Time')
  },
  path: ['Time'],
  keywords: []
};

export interface TimeConstructNodeInputs {
  hours: number;
  minutes: number;
  seconds: number;
}

export const TimeConstructNodeDef: NodeDef<
  TimeConstructNodeInputs,
  TimeInputNodeOutputs
> = {
  name: 'Construct',
  type: 'ConstructTime',
  inputs: {
    hours: NumberSocket('Hours'),
    minutes: NumberSocket('Minutes'),
    seconds: NumberSocket('Seconds')
  },
  outputs: {
    value: TimeSocket('Time')
  },
  path: ['Time', 'Converters'],
  keywords: []
};

export const TimeSplitNodeDef: NodeDef<
  TimeInputNodeOutputs,
  TimeConstructNodeInputs
> = {
  name: 'Split',
  type: 'SplitTime',
  inputs: {
    value: TimeSocket('Time')
  },
  outputs: {
    hours: NumberSocket('Hours'),
    minutes: NumberSocket('Minutes'),
    seconds: NumberSocket('Seconds')
  },
  path: ['Time', 'Converters'],
  keywords: []
};

export interface TimeCompareNodeInputs {
  a: Date;
  b: Date;
}

export interface TimeCompareNodeOutputs {
  value: boolean;
}

export const TimeCompareNodeDef: NodeDef<
  TimeCompareNodeInputs,
  TimeCompareNodeOutputs
> = {
  name: 'Compare Time',
  type: 'TimeCompare',
  inputs: {
    a: TimeSocket('Time A'),
    b: TimeSocket('Time B')
  },
  outputs: {
    value: BooleanSocket('A later than B')
  },
  path: ['Time', 'Operators'],
  keywords: ['time compare', 'earlier', 'later']
};
