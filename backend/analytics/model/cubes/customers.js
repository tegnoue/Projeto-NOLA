cube(`customers`, {
  sql_table: `public.customers`,
  
  data_source: `default`,
  
  joins: {
    stores: {
      sql: `${CUBE}.store_id = ${stores.id}`,
      relationship: `many_to_one`
    },
    
    sub_brands: {
      sql: `${CUBE}.sub_brand_id = ${sub_brands.id}`,
      relationship: `many_to_one`
    },

    sales: {
      sql: `${CUBE}.id = ${sales}.customer_id`,
      relationship: `hasMany`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    agree_terms: {
      sql: `agree_terms`,
      type: `boolean`
    },
    
    cpf: {
      sql: `cpf`,
      type: `string`
    },
    
    customer_name: {
      sql: `customer_name`,
      type: `string`
    },
    
    email: {
      sql: `email`,
      type: `string`
    },
    
    gender: {
      sql: `gender`,
      type: `string`
    },
    
    phone_number: {
      sql: `phone_number`,
      type: `string`
    },
    
    receive_promotions_email: {
      sql: `receive_promotions_email`,
      type: `boolean`
    },
    
    receive_promotions_sms: {
      sql: `receive_promotions_sms`,
      type: `boolean`
    },
    
    registration_origin: {
      sql: `registration_origin`,
      type: `string`
    },
    
    created_at: {
      sql: `created_at`,
      type: `time`
    },
    
    birth_date: {
      sql: `birth_date`,
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
