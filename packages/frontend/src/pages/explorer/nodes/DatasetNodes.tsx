import * as React from 'react';
import { Form, Select } from 'antd';
import { NodeOptions } from './BasicNodes';
import { StringSocket, DataSocket } from './Sockets';

const FormItem = Form.Item;
const Option = Select.Option;

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset'],
  keywords: [],
  form: ({ form: { getFieldDecorator }, state: { datasets } }) => (
    <Form layout="inline" hideRequiredMark>
      <FormItem label="Input">
        {getFieldDecorator('dataset', {
          rules: [{ required: true }]
        })(
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Dataset"
          >
            {datasets.map(ds => (
              <Option value={ds.id} key={ds.id}>
                {ds.name}
              </Option>
            ))}
          </Select>
        )}
      </FormItem>
    </Form>
  )
};

export const DatasetOutputNode: NodeOptions = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [],
  path: ['Dataset'],
  keywords: []
};

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset', 'Filters'],
  keywords: []
};

export const JoinDatasetsNode: NodeOptions = {
  title: 'Join Datasets',
  inputs: [
    DataSocket('Dataset A', 'input'),
    DataSocket('Dataset B', 'input'),
    StringSocket('Index Colum', 'input')
  ],
  outputs: [DataSocket('Combined', 'output')],
  path: ['Dataset', 'Aggregators'],
  keywords: []
};

export const AllDatasetNodes = [
  DatasetInputNode,
  DatasetOutputNode,
  DatasetSelectValuesNode,
  JoinDatasetsNode
];
