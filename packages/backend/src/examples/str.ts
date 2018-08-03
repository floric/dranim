import { ApolloContext, DataType, ValueSchema } from '@masterthesis/shared';

import { addValueSchema, createDataset } from '../main/workspace/dataset';
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
  ds = await createDataset('Cities', reqContext);
  for (const s of citySchemas) {
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
const createBoolValueSchema = (
  name: string,
  required: boolean = false,
  unique: boolean = false
) => ({
  name,
  type: DataType.BOOLEAN,
  required,
  fallback: 'true',
  unique
});

const passagesSchemas: Array<ValueSchema> = [
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

const citySchemas: Array<ValueSchema> = [
  createStringValueSchema('code', true, true),
  createStringValueSchema('clean_code', true, false),
  createStringValueSchema('place', true, true),
  createStringValueSchema('region', true, false),
  createStringValueSchema('big area', true, false),
  createStringValueSchema('WS_land_1689', true, false),
  createStringValueSchema('WS_land_1707', true, false),
  createStringValueSchema('WS_land_1713', true, false),
  createStringValueSchema('WS_land_1721', true, false),
  createStringValueSchema('WS_land_1735', true, false),
  createStringValueSchema('WS_land_1763', true, false),
  createStringValueSchema('WS_land_1772', true, false),
  createStringValueSchema('WS_land_1776', true, false),
  createStringValueSchema('WS_land_1793', true, false),
  createStringValueSchema('WS_land_1795', true, false),
  createStringValueSchema('WS_land_1807', true, false),
  createStringValueSchema('WS_land_1815', true, false),
  createStringValueSchema('WS_land_1821', true, false),
  createStringValueSchema('WS_land_1830', true, false),
  createBoolValueSchema('west_of_Helsingør', true, false),
  createStringValueSchema('Latitude', true, false),
  createStringValueSchema('lat-NS', true, false),
  createNumberValueSchema('lat-gr', true, false),
  createNumberValueSchema('lat-mi', true, false),
  createNumberValueSchema('lat-se', true, false),
  createStringValueSchema('Longitude', true, false),
  createStringValueSchema('long-EW', true, false),
  createNumberValueSchema('long-gr', true, false),
  createNumberValueSchema('long-mi', true, false),
  createNumberValueSchema('long-se', true, false),
  createNumberValueSchema('decLatitude', true, false),
  createNumberValueSchema('decLongitude', true, false),
  createStringValueSchema('Modern Country', true, false),
  createStringValueSchema('Modern name', true, false),
  createStringValueSchema('Province', true, false)
];

const commoditiesSchemas: Array<ValueSchema> = [
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
