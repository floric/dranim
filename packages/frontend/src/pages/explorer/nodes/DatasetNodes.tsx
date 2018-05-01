import * as React from 'react';
import { SFC } from 'react';

import { Node } from './Node';
import { DataSocket } from './Sockets';
import { EditorProps } from './BasicNodes';

export const DatasetInputNode: SFC<EditorProps> = props => (
  <Node
    {...props}
    title="Dataset Input"
    inputs={[]}
    outputs={[DataSocket('Dataset')]}
  />
);

export const DatasetSelectValuesNode: SFC<EditorProps> = props => (
  <Node
    {...props}
    title="Select Values"
    inputs={[DataSocket('Dataset')]}
    outputs={[DataSocket('Dataset')]}
  />
);
