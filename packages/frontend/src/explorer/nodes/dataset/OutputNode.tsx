import {
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs
} from '@masterthesis/shared';
import * as React from 'react';

import { ClientNodeDef } from '../AllNodes';

export const DatasetOutputNode: ClientNodeDef<DatasetOutputNodeInputs> = {
  name: DatasetOutputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => <p />
};
