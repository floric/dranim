import { ApolloContext, Entry } from '@masterthesis/shared';
import { IResolverObject } from 'graphql-tools';

import { getEntriesCount, getLatestEntries } from '../../main/workspace/entry';

export const Dataset: IResolverObject<any, ApolloContext> = {
  entriesCount: ({ id }, __, context): Promise<number> =>
    getEntriesCount(id, context),
  latestEntries: ({ id }, __, context): Promise<Array<Entry>> =>
    getLatestEntries(id, context)
};
