import { Valueschema } from '../graphql/resolvers/dataset';

export const passagesSchemas: Array<Valueschema> = [
  { name: 'ID', type: 'String', required: true, fallback: '', unique: true },
  {
    name: 'pass_day',
    type: 'Number',
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'pass_month',
    type: 'Number',
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'pass_year',
    type: 'Number',
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'shipmaster_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'shipmaster_b',
    type: 'String',
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'shipmaster_c',
    type: 'String',
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'shipmaster_d',
    type: 'String',
    required: false,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_city',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_b',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_c',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_d',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_country_e',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_coords_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_coords_b',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'domicile_coords_n_int',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'domicile_coords_e_int',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'departure_city',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_b',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_c',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_d',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_country_e',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_b',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'departure_coords_n_int',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'departure_coords_e_int',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'destination_city',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_b',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_c',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_d',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_country_e',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_a',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_b',
    type: 'String',
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'destination_coords_n_int',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'destination_coords_e_int',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  },
  {
    name: 'amount',
    type: 'Number',
    required: true,
    fallback: '1',
    unique: false
  },
  {
    name: 'tonnes',
    type: 'Number',
    required: true,
    fallback: '0',
    unique: false
  }
];
