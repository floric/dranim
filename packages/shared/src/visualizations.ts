import { GQLDataset } from './workspace';

export interface Visualization {
  id: string;
  name: string;
  type: string | null;
  datasetId: string;
}

export interface GQLVisualization {
  id: string;
  name: string;
  type: string | null;
  dataset: GQLDataset;
}
