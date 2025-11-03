cube(`coupons`, {
  sql_table: `public.coupons`,
  
  data_source: `default`,
  
  joins: {
    brands: {
      sql: `${CUBE}.brand_id = ${brands.id}`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    code: {
      sql: `code`,
      type: `string`
    },
    
    discount_type: {
      sql: `discount_type`,
      type: `string`
    },
    
    discount_value: {
      sql: `discount_value`,
      type: `string`
    },
    
    is_active: {
      sql: `is_active`,
      type: `boolean`
    },
    
    valid_from: {
      sql: `valid_from`,
      type: `time`
    },
    
    valid_until: {
      sql: `valid_until`,
      type: `time`
    }
  },
  
  measures: {
    count: {
      type: `count`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
