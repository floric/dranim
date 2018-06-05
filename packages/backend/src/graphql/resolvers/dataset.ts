import { Entry } from '@masterthesis/shared';

import { getEntriesCount, getLatestEntries } from '../../main/workspace/entry';

export const Dataset = {
  entriesCount: ({ _id }, __, { db }): Promise<number> =>
    getEntriesCount(db, _id),
  latestEntries: ({ _id }, __, { db }): Promise<Array<Entry>> =>
    getLatestEntries(db, _id)
};
