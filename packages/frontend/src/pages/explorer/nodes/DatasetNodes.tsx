import * as React from 'react';
import { Form, Select } from 'antd';
import { NodeOptions } from './BasicNodes';
import {
  StringSocket,
  DataSocket,
  DATASET_TYPE,
  OutputSocketInformation
} from './Sockets';
import { getOrDefault } from './utils';

const FormItem = Form.Item;
const Option = Select.Option;

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset'],
  keywords: [],
  onClientExecution: (inputs, context) => {
    const dsId = getOrDefault<string | null>(
      context.node.form,
      'dataset',
      null
    );
    if (!dsId) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }
    const ds = context.state.datasets.find(n => n.id === dsId);
    if (!ds) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DATASET_TYPE,
          meta: [{ name: 'schemas', info: ds.valueschemas.map(n => n.name) }]
        }
      ]
    ]);
  },
  form: ({
    form: { getFieldDecorator },
    state: { datasets },
    node: { form }
  }) => (
    <Form layout="inline" hideRequiredMark>
      <FormItem label="Input">
        {getFieldDecorator('dataset', {
          rules: [{ required: true }],
          initialValue: getOrDefault<string | undefined>(
            form,
            'dataset',
            undefined
          )
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
  keywords: [],
  onClientExecution: () => new Map()
};

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset', 'Filters'],
  keywords: [],
  onClientExecution: (inputs, context) => {
    const validInput = getValidInput('Dataset', inputs);
    if (!validInput) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const inputValues = validInput.meta
      ? validInput.meta.filter(m => m.name === 'schemas').map(s => s.info)[0]
      : [];

    const selectedValues = getOrDefault<Array<string>>(
      context.node.form,
      'values',
      []
    );

    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DATASET_TYPE,
          meta: [
            {
              name: 'schemas',
              info: selectedValues
                ? inputValues.filter(n => selectedValues.includes(n))
                : []
            }
          ]
        }
      ]
    ]);
  },
  form: ({
    form: { getFieldDecorator },
    state: { datasets, connections, nodes },
    node: { id, type, form },
    inputs
  }) => {
    const dsInput = inputs.get('Dataset');
    const metaValues =
      dsInput && dsInput.isPresent !== false && dsInput.meta
        ? dsInput.meta.find(m => m.name === 'schemas') || null
        : null;
    const options = metaValues ? metaValues.info : [];
    return (
      <Form layout="inline">
        <FormItem label="Input">
          {getFieldDecorator('values', {
            initialValue: getOrDefault<Array<string>>(form, 'values', [])
          })(
            <Select
              mode="multiple"
              style={{ width: 200 }}
              placeholder="Select Values"
            >
              {options.map(c => <Option key={c}>{c}</Option>)}
            </Select>
          )}
        </FormItem>
      </Form>
    );
  }
};

const getValidInput = (
  name: string,
  inputs: Map<string, OutputSocketInformation>
) => {
  const elem = inputs.get(name);
  if (elem && elem.isPresent !== false) {
    return elem;
  }
  return null;
};

export const JoinDatasetsNode: NodeOptions = {
  title: 'Join Datasets',
  inputs: [
    DataSocket('Dataset A', 'input'),
    DataSocket('Dataset B', 'input'),
    StringSocket('Index Colum', 'input')
  ],
  outputs: [DataSocket('Combined', 'output')],
  onClientExecution: (inputs, context) => {
    const validInputA = getValidInput('Dataset A', inputs);
    const validInputB = getValidInput('Dataset B', inputs);
    if (!validInputA || !validInputB) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const inputValuesA = validInputA.meta
      ? validInputA.meta.filter(m => m.name === 'schema').map(s => s.info)
      : [];
    const inputValuesB = validInputB.meta
      ? validInputB.meta.filter(m => m.name === 'schema').map(s => s.info)
      : [];

    const idValue = getOrDefault<string | null>(
      context.node.form,
      'value',
      null
    );

    if (!idValue) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const isIdPresentInInputs =
      inputValuesA.includes(idValue) && inputValuesB.includes(idValue);
    if (!isIdPresentInInputs) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const allSchemas = new Set(inputValuesA.concat(inputValuesB));
    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DATASET_TYPE,
          meta: [
            {
              name: 'schemas',
              info: Array.from(allSchemas)
            }
          ]
        }
      ]
    ]);
  },
  path: ['Dataset', 'Aggregators'],
  keywords: [],
  form: ({ form: { getFieldDecorator }, state: { datasets } }) => {
    return (
      <Form layout="inline" hideRequiredMark>
        <FormItem label="Input">
          {getFieldDecorator('value', {
            rules: [{ required: true }]
          })(
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select ID Value"
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
    );
  }
};

export const AllDatasetNodes = [
  DatasetInputNode,
  DatasetOutputNode,
  DatasetSelectValuesNode,
  JoinDatasetsNode
];
