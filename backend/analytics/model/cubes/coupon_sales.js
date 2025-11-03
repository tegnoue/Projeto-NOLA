cube(`coupon_sales`, {
  sql_table: `public.coupon_sales`,
  
  data_source: `default`,
  
  joins: {
    coupons: {
      sql: `${CUBE}.coupon_id = ${coupons.id}`,
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
    
    sponsorship: {
      sql: `sponsorship`,
      type: `string`
    },
    
    target: {
      sql: `target`,
      type: `string`
    }
  },
  
  measures: {
    count: {
      type: `count`
    },
    
    value: {
      sql: `value`,
      type: `sum`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
