cube(`channels`, {
  sql_table: `public.channels`,
  
  data_source: `default`,
  
  joins: {
    brands: {
      sql: `${CUBE}.brand_id = ${brands.id}`,
      relationship: `many_to_one`
    },

    sales: {
      sql: `${CUBE}.id = ${sales.channel_id}`,
      relationship: `hasMany`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    description: {
      sql: `description`,
      type: `string`
    },
    
    name: {
      sql: `name`,
      type: `string`
    },
    
    type: {
      sql: `type`,
      type: `string`
    },
    
    created_at: {
      sql: `created_at`,
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
