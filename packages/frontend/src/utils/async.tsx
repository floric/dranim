import * as React from 'react';

import { asyncComponent } from 'react-async-component';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';

export const getAsyncPage = (importFn: () => any) =>
  asyncComponent({
    resolve: () => importFn(),
    LoadingComponent: () => <LoadingCard text="Loading page..." />,
    ErrorComponent: ({ error }) => <UnknownErrorCard error={error} />
  });
