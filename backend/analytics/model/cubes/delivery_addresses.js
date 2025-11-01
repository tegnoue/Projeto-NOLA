cube(`delivery_addresses`, {
  sql_table: `public.delivery_addresses`,
  
  data_source: `default`,
  
  joins: {
    delivery_sales: {
      sql: `${CUBE}.delivery_sale_id = ${delivery_sales.id}`,
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
    
    delivery_sale_id: {
      sql: `delivery_sale_id`,
      type: `number`
    },
    
    city: {
      sql: `city`,
      type: `string`
    },
    
    complement: {
      sql: `complement`,
      type: `string`
    },
    
    country: {
      sql: `country`,
      type: `string`
    },
    
    formatted_address: {
      sql: `formatted_address`,
      type: `string`
    },
    
    neighborhood: {
      sql: `neighborhood`,
      type: `string`
    },
    
    number: {
      sql: `number`,
      type: `string`
    },
    
    postal_code: {
      sql: `postal_code`,
      type: `string`
    },
    
    reference: {
      sql: `reference`,
      type: `string`
    },
    
    state: {
      sql: `state`,
      type: `string`
    },
    
    street: {
      sql: `street`,
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
