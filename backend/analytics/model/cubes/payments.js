cube(`payments`, {
  sql_table: `public.payments`,
  
  data_source: `default`,
  
  joins: {
    payment_types: {
      sql: `${CUBE}.payment_type_id = ${payment_types.id}`,
      relationship: `many_to_one`
    },
    
    sales: {
      sql: `${CUBE}.sale_id = ${sales.id}`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    currency: {
      sql: `currency`,
      type: `string`
    },
    
    description: {
      sql: `description`,
      type: `string`
    },
    
    is_online: {
      sql: `is_online`,
      type: `boolean`
    },
    
    value: {
      sql: `value`,
      type: `string`
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
