import { Moment } from 'moment';

import { NodeDef } from '../nodes';
import { NumberSocket, TimeSocket } from '../sockets';

export interface TimeInputNodeOutputs {
  value: Moment;
}

export interface TimeInputNodeForm {
  value: Moment;
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
