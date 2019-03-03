import React, { Suspense, lazy } from 'react';

import { LoadingCard } from '../components/layout/CustomCards';

export const getAsyncPage = (importFn: () => any) => {
  const Component = lazy(importFn);

  return props => (
    <Suspense fallback={<LoadingCard text="Loading..." />}>
      <Component {...props} />
    </Suspense>
  );
};
