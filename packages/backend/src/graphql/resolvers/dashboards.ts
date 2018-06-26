import { OutputResult } from '@masterthesis/shared';

import { getResultsForDashboard } from '../../main/dashboards/results';

export const Dashboard = {
  results: ({ id }, __, { db }): Promise<Array<OutputResult>> =>
    getResultsForDashboard(id, db)
};
