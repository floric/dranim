import * as React from 'react';
import { Query, QueryResult } from 'react-apollo';
import { LoadingCard, UnknownErrorCard } from './CustomCards';

export interface HandledQueryProps<Data, Variables> {
  query: string;
  variables?: Variables;
  children: (data: QueryResult<Data, Variables>) => React.ReactNode;
}

export class HandledQuery<Data, Variables = null> extends React.Component<
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
            return <UnknownErrorCard error={error} />;
          }

          return children(result);
        }}
      </Query>
    );
  }
}
