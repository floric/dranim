import { GQLOutputResult } from './nodes';

export interface Dashboard {
  id: string;
  name: string;
}

export interface GQLDashboard {
  id: string;
  name: string;
  results: Array<GQLOutputResult>;
}
