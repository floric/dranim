import { Entry } from '@masterthesis/shared';

import { getEntriesCount, getLatestEntries } from '../../main/workspace/entry';

export const Dataset = {
  entriesCount: ({ id }, __, { db }): Promise<number> =>
    getEntriesCount(db, id),
  latestEntries: ({ id }, __, { db }): Promise<Array<Entry>> =>
    getLatestEntries(db, id)
};
