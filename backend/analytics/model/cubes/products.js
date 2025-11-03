cube(`products`, {
  sql_table: `public.products`,
  
  data_source: `default`,
  
  joins: {
    brands: {
      sql: `${CUBE}.brand_id = ${brands.id}`,
      relationship: `many_to_one`
    },
    
    categories: {
      sql: `${CUBE}.category_id = ${categories.id}`,
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
    
    name: {
      sql: `name`,
      type: `string`
    },
    
    pos_uuid: {
      sql: `pos_uuid`,
      type: `string`
    },
    
    deleted_at: {
      sql: `deleted_at`,
      type: `time`
    },

    grouped_name: {
      type: `string`,
      title: "Produto (Agrupado)",
      sql: `
        CASE 
          WHEN POSITION(' #' IN ${CUBE}.name) > 0 
          THEN SUBSTRING(${CUBE}.name FROM 1 FOR POSITION(' #' IN ${CUBE}.name) - 1)
          ELSE ${CUBE}.name
        END
      `
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
