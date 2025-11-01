cube(`stores`, {
  sql_table: `public.stores`,
  
  data_source: `default`,
  
  joins: {
    brands: {
      sql: `${CUBE}.brand_id = ${brands.id}`,
      relationship: `many_to_one`
    },
    
    sub_brands: {
      sql: `${CUBE}.sub_brand_id = ${sub_brands.id}`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    address_street: {
      sql: `address_street`,
      type: `string`
    },
    
    city: {
      sql: `city`,
      type: `string`
    },
    
    district: {
      sql: `district`,
      type: `string`
    },
    
    is_active: {
      sql: `is_active`,
      type: `boolean`
    },
    
    is_holding: {
      sql: `is_holding`,
      type: `boolean`
    },
    
    is_own: {
      sql: `is_own`,
      type: `boolean`
    },
    
    latitude: {
      sql: `latitude`,
      type: `string`
    },
    
    longitude: {
      sql: `longitude`,
      type: `string`
    },
    
    name: {
      sql: `name`,
      type: `string`
    },
    
    state: {
      sql: `state`,
      type: `string`
    },
    
    zipcode: {
      sql: `zipcode`,
      type: `string`
    },
    
    created_at: {
      sql: `created_at`,
      type: `time`
    },
    
    creation_date: {
      sql: `creation_date`,
      type: `time`
    }
  },
  
  measures: {
    count: {
      type: `count`
    },
    
    address_number: {
      sql: `address_number`,
      type: `sum`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
