import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';

import App from './App';
import { client } from './io/apolloClient';

import 'antd/dist/antd.css';
import 'ant-design-pro/dist/ant-design-pro.css';

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root') as HTMLElement
);
