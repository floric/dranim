export interface Socket {
  color: string;
  title: string;
  name: string;
}

// tslint:disable-next-line:no-empty-interface
export interface Output extends Socket {}

// tslint:disable-next-line:no-empty-interface
export interface Input extends Socket {}

export const DataSocket = (name: string): Socket => ({
  color: '#0099ff',
  title: 'Dataset',
  name
});

export const NumberSocket = (name: string): Socket => ({
  color: '#ff9900',
  title: 'Number',
  name
});

export const StringSocket = (name: string): Socket => ({
  color: '#ff0099',
  title: 'String',
  name
});
