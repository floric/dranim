import { Entry } from '@masterthesis/shared';

import { getEntriesCount, getLatestEntries } from '../../main/workspace/entry';

export const Dataset = {
  entriesCount: ({ id }, __, context): Promise<number> =>
    getEntriesCount(id, context),
  latestEntries: ({ id }, __, context): Promise<Array<Entry>> =>
    getLatestEntries(id, context)
};
