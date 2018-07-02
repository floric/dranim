import { NodeDef } from '../nodes';
import { NumberSocket, TimeSocket } from '../sockets';

export interface TimeInputNodeOutputs {
  value: Date;
}

export interface TimeInputNodeForm {
  value: Date;
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
  path: ['Time'],
  keywords: []
};
