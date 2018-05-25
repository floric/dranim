import { DataType } from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addValueSchema,
  createDataset,
  Valueschema
} from '../main/workspace/dataset';
import { createWorkspace } from '../main/workspace/workspace';

export const createSTRDemoData = async (db: Db) => {
  let ds = await createDataset(db, 'Passages');
  for (const s of passagesSchemas) {
    await addValueSchema(db, ds.id, s);
  }
  ds = await createDataset(db, 'Commodities');
  for (const s of commoditiesSchemas) {
    await addValueSchema(db, ds.id, s);
  }
  await createWorkspace(
    db,
    'Trade volumes',
    'Contains aggregation and filtering for trading development from 1600 until 1800.'
  );
  return true;
};

export const passagesSchemas: Array<Valueschema> = [
  {
    name: 'passage_id',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: true
  },
  {
    name: 'pass_day',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'pass_month',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'pass_year',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'master_firstname',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'master_patronymic',
    type: DataType.STRING,
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'master_article',
    type: DataType.STRING,
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'master_surname',
    type: DataType.STRING,
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_city',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_region',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1763',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1795',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1815',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1830',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_latitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_longitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_decLatitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'domicile_decLongitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'departure_city',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_region',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1763',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1795',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1815',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1830',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_latitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_longitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_decLatitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'departure_coords_decLongitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'destination_city',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_region',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1763',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1795',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1815',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1830',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_latitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_longitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_decLatitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'destination_coords_decLongitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'commodities_number',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'tonnes',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  }
];

export const commoditiesSchemas: Array<Valueschema> = [
  {
    name: 'commodity_id',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: true
  },
  {
    name: 'passage_id',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'pass_day',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'pass_month',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'pass_year',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'master_firstname',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'master_patronymic',
    type: DataType.STRING,
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'master_article',
    type: DataType.STRING,
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'master_surname',
    type: DataType.STRING,
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_city',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_region',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1763',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1795',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1815',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_1830',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_latitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_longitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_decLatitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'domicile_decLongitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'departure_city',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_region',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1763',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1795',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1815',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_1830',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_latitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_longitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_decLatitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'departure_coords_decLongitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'destination_city',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_region',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1763',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1795',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1815',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_1830',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_latitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_longitude',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_decLatitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'destination_coords_decLongitude',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'measure',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'Commodity',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'quantity',
    type: DataType.NUMBER,
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'tonnes',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
    unique: false
  }
];
