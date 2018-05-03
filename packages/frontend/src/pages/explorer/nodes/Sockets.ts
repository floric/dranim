export type SocketType = 'output' | 'input';

export interface Socket {
  color: string;
  dataType: string;
  name: string;
  type: SocketType;
}

export const DataSocket = (name: string, type: SocketType): Socket => ({
  color: '#0099ff',
  dataType: 'Dataset',
  type,
  name
});

export const NumberSocket = (name: string, type: SocketType): Socket => ({
  color: '#ff9900',
  dataType: 'Number',
  type,
  name
});

export const StringSocket = (name: string, type: SocketType): Socket => ({
  color: '#ff0099',
  dataType: 'String',
  type,
  name
});
