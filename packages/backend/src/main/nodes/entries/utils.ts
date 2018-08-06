import {
  ApolloContext,
  DatasetMeta,
  Entry,
  FormValues,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import * as PromiseQueue from 'promise-queue';
import { Log } from '../../../logging';
import { addValueSchema } from '../../workspace/dataset';
import { getEntryCollection } from '../../workspace/entry';

export const CHECK_FREQUENCY = 5000;
export const CONCURRENT_JOBS_COUNT = 4;

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
  checkFrequency?: number;
}

export const processEntries = async (
  dsId: string,
  nodeId: string,
  processFn: (entry: Entry) => Promise<void>,
  reqContext: ApolloContext,
  options?: ProcessOptions
): Promise<void> => {
  const coll = getEntryCollection(dsId, reqContext.db);
  const cursor = coll.find();
  await processDocumentsWithCursor(
    cursor,
    nodeId,
    processFn,
    reqContext,
    options
  );
};

export const processDocumentsWithCursor = async <T = any>(
  cursor: {
    next: () => Promise<any>;
    hasNext?: () => Promise<boolean>;
    close: () => Promise<any>;
  },
  nodeId: string,
  processFn: (entry: T) => Promise<void>,
  reqContext: ApolloContext,
  options?: ProcessOptions
): Promise<void> => {
  const queue = new PromiseQueue(
    options && options.concurrency ? options.concurrency : CONCURRENT_JOBS_COUNT
  );
  const checkFrequency =
    options && options.checkFrequency
      ? options.checkFrequency
      : CHECK_FREQUENCY;

  while (await cursor.hasNext!()) {
    const doc = await cursor.next();
    queue.add(() => processFn(doc!));
  }

  await cursor.close();
  await processQueue(queue, checkFrequency);
};

const processQueue = async (queue: PromiseQueue, checkFrequency: number) => {
  let lastRemainingJobsCount = queue.getQueueLength();

  Log.info(
    `Processing queue with ${lastRemainingJobsCount} jobs with maximum ${queue.getPendingLength()} concurrently`
  );

  await new Promise((resolve, reject) => {
    try {
      const timer = setInterval(() => {
        const currentRemainingJobsCount = queue.getQueueLength();
        Log.info(
          `${currentRemainingJobsCount} jobs left, done in ${checkFrequency /
            1000} seconds: ${lastRemainingJobsCount -
            currentRemainingJobsCount}`
        );
        lastRemainingJobsCount = currentRemainingJobsCount;
        if (currentRemainingJobsCount === 0) {
          clearInterval(timer);
          resolve();
        }
      }, checkFrequency);
    } catch (err) {
      Log.error(`Queue failed with error: ${err.message}`);
      reject();
    }
  });
};
