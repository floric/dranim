import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { BrowserRouter } from 'react-router-dom';

import { client } from './io/apollo-client';
import { getAsyncPage } from './utils/async';

import 'antd/dist/antd.css';

const App = getAsyncPage(() => import('./App'));

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root') as HTMLElement
);
