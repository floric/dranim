import {
  ApolloContext,
  DatasetMeta,
  Entry,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  ValueSchema
} from '@masterthesis/shared';

import { addValueSchema } from '../../workspace/dataset';
import { getEntriesCount, getEntryCollection } from '../../workspace/entry';
import { setProgress } from '../../workspace/nodes-detail';

export const copySchemas = (
  schemas: Array<ValueSchema>,
  newDsId: string,
  reqContext: ApolloContext
) => Promise.all(schemas.map(s => addValueSchema(newDsId, s, reqContext)));

export const getDynamicEntryContextInputs = async (
  inputDefs: SocketDefs<any>,
  inputs: { dataset: SocketMetaDef<DatasetMeta> },
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
      isDynamic: true
    };
  });

  return dynInputDefs;
};

export const processEntries = async (
  dsId: string,
  nodeId: string,
  processFn: (entry: Entry) => Promise<void>,
  reqContext: ApolloContext
): Promise<void> => {
  const coll = getEntryCollection(dsId, reqContext.db);
  const cursor = coll.find();
  const entriesCount = await getEntriesCount(dsId, reqContext);
  let i = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await processFn(doc);

    if (i % 100 === 0) {
      await setProgress(nodeId, i / entriesCount, reqContext);
    }

    i += 1;
  }

  await cursor.close();
};
