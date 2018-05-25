import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { withClientState } from 'apollo-link-state';
import { createUploadLink } from 'apollo-upload-client';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? '/api/graphql'
    : 'http://localhost:3000/api/graphql';

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
      credentials: 'same-origin'
    })
  ]),
  cache: stateCache
});
