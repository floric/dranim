import React, { Component } from 'react';
import { UnknownErrorCard } from '../components/layout/CustomCards';

export class ErrorBoundary extends Component<
  {},
  { error: string | null; hasError: boolean }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(error);
  }

  render() {
    const { error, hasError } = this.state;

    if (hasError) {
      return <UnknownErrorCard error={error} />;
    }

    return this.props.children;
  }
}
