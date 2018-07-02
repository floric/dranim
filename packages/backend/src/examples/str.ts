import { ApolloContext, DataType } from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset,
  Valueschema
} from '../main/workspace/dataset';
import { createWorkspace } from '../main/workspace/workspace';

export const createSTRDemoData = async (reqContext: ApolloContext) => {
  let ds = await createDataset('Passages', reqContext);
  for (const s of passagesSchemas) {
    await addValueSchema(ds.id, s, reqContext);
  }
  ds = await createDataset('Commodities', reqContext);
  for (const s of commoditiesSchemas) {
    await addValueSchema(ds.id, s, reqContext);
  }
  await createWorkspace(
    'Trade volumes',
    reqContext,
    'Contains aggregation and filtering for trading development from 1600 until 1800.'
  );
  return true;
};

const createNumberValueSchema = (
  name: string,
  required: boolean = false,
  unique: boolean = false
) => ({
  name,
  type: DataType.NUMBER,
  required,
  fallback: '1',
  unique
});
const createStringValueSchema = (
  name: string,
  required: boolean = false,
  unique: boolean = false
) => ({
  name,
  type: DataType.STRING,
  required,
  fallback: '',
  unique
});

const passagesSchemas: Array<Valueschema> = [
  createStringValueSchema('passage_id', true, true),
  createNumberValueSchema('pass_day', true),
  createNumberValueSchema('pass_month', true),
  createNumberValueSchema('pass_year', true),
  createStringValueSchema('master_firstname', true),
  createStringValueSchema('master_patronymic'),
  createStringValueSchema('master_article'),
  createStringValueSchema('master_surname'),
  createStringValueSchema('domicile_city', true),
  createStringValueSchema('domicile_region', true),
  createStringValueSchema('domicile_country_1763', true),
  createStringValueSchema('domicile_country_1795', true),
  createStringValueSchema('domicile_country_1815', true),
  createStringValueSchema('domicile_country_1830', true),
  createStringValueSchema('domicile_latitude', true),
  createStringValueSchema('domicile_longitude', true),
  createNumberValueSchema('domicile_decLatitude', true),
  createNumberValueSchema('domicile_decLongitude', true),
  createStringValueSchema('departure_city', true),
  createStringValueSchema('departure_region', true),
  createStringValueSchema('departure_country_1763', true),
  createStringValueSchema('departure_country_1795', true),
  createStringValueSchema('departure_country_1815', true),
  createStringValueSchema('departure_country_1830', true),
  createStringValueSchema('departure_latitude', true),
  createStringValueSchema('departure_longitude', true),
  createNumberValueSchema('departure_decLatitude', true),
  createNumberValueSchema('departure_decLongitude', true),
  createStringValueSchema('destination_city', true),
  createStringValueSchema('destination_region', true),
  createStringValueSchema('destination_country_1763', true),
  createStringValueSchema('destination_country_1795', true),
  createStringValueSchema('destination_country_1815', true),
  createStringValueSchema('destination_country_1830', true),
  createStringValueSchema('destination_latitude', true),
  createStringValueSchema('destination_longitude', true),
  createNumberValueSchema('destination_decLatitude', true),
  createNumberValueSchema('destination_decLongitude', true),
  createNumberValueSchema('commodities_number', true),
  createNumberValueSchema('tonnes', true)
];

const commoditiesSchemas: Array<Valueschema> = [
  createStringValueSchema('commodity_id', true, true),
  createStringValueSchema('passage_id', true),
  createNumberValueSchema('pass_day', true),
  createNumberValueSchema('pass_month', true),
  createNumberValueSchema('pass_year', true),
  createStringValueSchema('master_firstname', true),
  createStringValueSchema('master_patronymic'),
  createStringValueSchema('master_article'),
  createStringValueSchema('master_surname'),
  createStringValueSchema('domicile_city', true),
  createStringValueSchema('domicile_region', true),
  createStringValueSchema('domicile_country_1763', true),
  createStringValueSchema('domicile_country_1795', true),
  createStringValueSchema('domicile_country_1815', true),
  createStringValueSchema('domicile_country_1830', true),
  createStringValueSchema('domicile_latitude', true),
  createStringValueSchema('domicile_longitude', true),
  createNumberValueSchema('domicile_decLatitude', true),
  createNumberValueSchema('domicile_decLongitude', true),
  createStringValueSchema('departure_city', true),
  createStringValueSchema('departure_region', true),
  createStringValueSchema('departure_country_1763', true),
  createStringValueSchema('departure_country_1795', true),
  createStringValueSchema('departure_country_1815', true),
  createStringValueSchema('departure_country_1830', true),
  createStringValueSchema('departure_latitude', true),
  createStringValueSchema('departure_longitude', true),
  createNumberValueSchema('departure_decLatitude', true),
  createNumberValueSchema('departure_decLongitude', true),
  createStringValueSchema('destination_city', true),
  createStringValueSchema('destination_region', true),
  createStringValueSchema('destination_country_1763', true),
  createStringValueSchema('destination_country_1795', true),
  createStringValueSchema('destination_country_1815', true),
  createStringValueSchema('destination_country_1830', true),
  createStringValueSchema('destination_latitude', true),
  createStringValueSchema('destination_longitude', true),
  createNumberValueSchema('destination_decLatitude', true),
  createNumberValueSchema('destination_decLongitude', true),
  createNumberValueSchema('measure', true),
  createStringValueSchema('commodity', true),
  createNumberValueSchema('quantity', true),
  createNumberValueSchema('tonnes', true)
];
