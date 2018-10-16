import React, { Component, ReactNode } from 'react';

import { DocumentNode } from 'graphql';
import { Query, QueryResult } from 'react-apollo';
import { Redirect, Route } from 'react-router-dom';

import { resetCache } from '../io/auth';
import { LoadingCard, UnknownErrorCard } from './layout/CustomCards';

export interface HandledQueryProps<Data, Variables> {
  query: DocumentNode;
  variables?: Variables;
  children: (data: QueryResult<Data, Variables>) => ReactNode;
}

export class HandledQuery<Data, Variables = null> extends Component<
  HandledQueryProps<Data, Variables>
> {
  public render() {
    const { query, variables, children } = this.props;
    return (
      <Query<Data, Variables> query={query} variables={variables}>
        {result => {
          const { loading, error } = result;
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            const authError = error.graphQLErrors.find(
              n => n.extensions && n.extensions.code === 'UNAUTHENTICATED'
            );
            if (authError) {
              return <Route path="/" render={() => <Redirect to="/login" />} />;
            }

            return <UnknownErrorCard error={error} />;
          }

          if (Object.keys(result.data).length === 0) {
            throw new Error('Empty query result should never happen.');
          }

          return children(result);
        }}
      </Query>
    );
  }
}
