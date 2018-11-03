import {
  ApolloContext,
  DatasetMeta,
  Entry,
  FormValues,
  sleep,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import PromiseQueue from 'promise-queue';
import { Log } from '../../../logging';
import { addValueSchema } from '../../workspace/dataset';
import { getEntryCollection } from '../../workspace/entry';
import { updateProgress } from '../../workspace/nodes-detail';

export const copySchemas = (
  schemas: Array<ValueSchema>,
  newDsId: string,
  reqContext: ApolloContext
) => Promise.all(schemas.map(s => addValueSchema(newDsId, s, reqContext)));

export const getDynamicEntryContextInputs = async (
  inputDefs: SocketDefs<any>,
  inputs: { dataset: SocketMetaDef<DatasetMeta> },
  form: FormValues<any>,
  reqContext: ApolloContext
): Promise<{ [name: string]: SocketDef }> => {
  if (
    !inputs.dataset ||
    !inputs.dataset.isPresent ||
    !inputs.dataset.content.schema
  ) {
    return {};
  }

  const dynInputDefs = {};
  inputs.dataset.content.schema.forEach(s => {
    dynInputDefs[s.name] = {
      dataType: s.type,
      displayName: s.name,
      state: SocketState.DYNAMIC
    };
  });

  return dynInputDefs;
};

export interface ProcessOptions {
  concurrency?: number;
}

export const processEntries = async (
  dsId: string,
  processFn: (entry: Entry) => Promise<void>,
  reqContext: ApolloContext,
  options?: ProcessOptions
): Promise<void> => {
  const coll = getEntryCollection(dsId, reqContext.db);
  const cursor = coll.find();
  await processDocumentsWithCursor(cursor, processFn, options);
};

export const processDocumentsWithCursor = async <T = any>(
  cursor: {
    next: () => Promise<any>;
    hasNext?: () => Promise<boolean>;
    close: () => Promise<any>;
  },
  processFn: (entry: T) => Promise<void>,
  options?: ProcessOptions
): Promise<void> => {
  const queue = new PromiseQueue(
    options && options.concurrency ? options.concurrency : 4
  );

  try {
    while (await cursor.hasNext!()) {
      const doc = await cursor.next();
      await queue.add(() => processFn(doc!));
    }
  } catch (err) {
    Log.error(`Queue failed with error: ${err.message}`);
    throw new Error('Process in queue has failed');
  }

  await cursor.close();
};

export const updateNodeProgressWithSleep = async (
  i: number,
  total: number,
  nodeId: string,
  reqContext: ApolloContext,
  updateAmount = 5
) => {
  const updateFrequency = Math.ceil(total / updateAmount);
  if (i % updateFrequency === 0) {
    const progress = (i * 100) / total;
    await Promise.all([
      updateProgress(nodeId, progress, reqContext),
      sleep(100)
    ]);
    Log.info(`Updated progress of ${nodeId} to ${progress}`);
  }
};
