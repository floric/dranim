import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';

import { logout } from './auth';

export const API_URL =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.BACKEND_DOMAIN}`
    : 'http://localhost:3000';

const stateCache = new InMemoryCache();

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('SESSION_TOKEN');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(
    ApolloLink.from([
      onError(err => {
        const { graphQLErrors, networkError } = err;

        if (
          networkError &&
          (networkError as any).response &&
          (networkError as any).response.status === 401
        ) {
          logout();
          window.location.reload();
          return;
        }

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
        uri: `${API_URL}/graphql`,
        credentials: 'include'
      })
    ])
  ),
  cache: stateCache
});
