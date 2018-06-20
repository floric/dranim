import {
  DatasetMeta,
  Entry,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { addValueSchema } from '../../workspace/dataset';
import { getEntriesCount, getEntryCollection } from '../../workspace/entry';
import { setProgress } from '../../workspace/nodes-detail';

export const copySchemas = (
  schemas: Array<ValueSchema>,
  newDsId: string,
  db: Db
) => Promise.all(schemas.map(s => addValueSchema(db, newDsId, s)));

export const getDynamicEntryContextInputs = async (
  inputDefs: SocketDefs<any>,
  inputs: { dataset: SocketMetaDef<DatasetMeta> },
  db: Db
): Promise<{ [name: string]: SocketDef }> => {
  if (!inputs.dataset || !inputs.dataset.isPresent) {
    return {};
  }

  const dynInputDefs = {};
  inputs.dataset.content!.schema.forEach(s => {
    dynInputDefs[s.name] = {
      dataType: s.type,
      displayName: s.name,
      isDynamic: true
    };
  });

  return dynInputDefs;
};

export const processEntries = async (
  db: Db,
  dsId: string,
  nodeId: string,
  processFn: (entry: Entry) => Promise<void>
) => {
  const coll = getEntryCollection(db, dsId);
  const cursor = coll.find();
  const entriesCount = await getEntriesCount(db, dsId);
  let i = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await processFn(doc);

    if (i % 100 === 0) {
      await setProgress(nodeId, i / entriesCount, db);
    }

    i += 1;
  }

  await cursor.close();
};
