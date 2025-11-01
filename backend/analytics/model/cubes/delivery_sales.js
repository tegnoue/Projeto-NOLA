cube(`delivery_sales`, {
  sql_table: `public.delivery_sales`,
  
  data_source: `default`,
  
  joins: {
    sales: {
      sql: `${CUBE}.sale_id = ${sales.id}`,
      relationship: `many_to_one`
    },
    delivery_addresses: {
      sql: `${CUBE}.id = ${delivery_addresses}.delivery_sale_id`,
      relationship: `hasOne`
  },
    neighborhood: {
      sql: `neighborhood`,
      type: `string`
  }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },

    sale_id: {
      sql: `sale_id`,
      type: `number`
    },
    
    courier_id: {
      sql: `courier_id`,
      type: `string`
    },
    
    courier_name: {
      sql: `courier_name`,
      type: `string`
    },
    
    courier_phone: {
      sql: `courier_phone`,
      type: `string`
    },
    
    courier_type: {
      sql: `courier_type`,
      type: `string`
    },
    
    delivered_by: {
      sql: `delivered_by`,
      type: `string`
    },
    
    delivery_type: {
      sql: `delivery_type`,
      type: `string`
    },
    
    mode: {
      sql: `mode`,
      type: `string`
    },
    
    status: {
      sql: `status`,
      type: `string`
    },
    
    timing: {
      sql: `timing`,
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
