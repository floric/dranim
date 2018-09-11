import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';

import { logout } from './auth';

export const API_URL =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.BACKEND_DOMAIN}`
    : 'http://localhost:3000';

const cache = new InMemoryCache();
const linkOptions = {
  uri: `${API_URL}/graphql`,
  credentials: 'include'
};

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('SESSION_TOKEN');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const errorLink = onError(err => {
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
});
const uploadLink = createUploadLink(linkOptions);
const batchLink = new BatchHttpLink({ batchInterval: 30, ...linkOptions });

export const client = new ApolloClient({
  link: authLink.concat(
    ApolloLink.split(
      op => op.getContext().hasUpload,
      ApolloLink.from([errorLink, uploadLink]),
      ApolloLink.from([errorLink, batchLink])
    )
  ),
  cache
});
