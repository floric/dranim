import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { createUploadLink } from 'apollo-upload-client';
import { withClientState } from 'apollo-link-state';
import customFetch from './customFetch';

const API_URL = '/api/graphql';

const stateCache = new InMemoryCache();

const stateLink = withClientState({
  cache: stateCache,
  defaults: {
    explorer: {
      __typename: 'Explorer',
      socketPositions: []
    }
  },
  resolvers: {
    Mutation: {}
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([
    stateLink,
    onError(err => {
      const { graphQLErrors, networkError } = err;

      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    createUploadLink({
      uri: API_URL,
      credentials: 'same-origin',
      fetch:
        typeof window === 'undefined' ? (global as any).fetch : customFetch,
      fetchOptions: {
        onProgress: progress => {
          console.log(100.0 * progress.loaded / progress.total);
        }
      }
    })
  ]),
  cache: stateCache
});
