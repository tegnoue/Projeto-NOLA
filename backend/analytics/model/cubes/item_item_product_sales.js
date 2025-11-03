cube(`item_item_product_sales`, {
  sql_table: `public.item_item_product_sales`,
  
  data_source: `default`,
  
  joins: {
    items: {
      sql: `${CUBE}.item_id = ${items.id}`,
      relationship: `many_to_one`
    },
    
    item_product_sales: {
      sql: `${CUBE}.item_product_sale_id = ${item_product_sales.id}`,
      relationship: `many_to_one`
    },
    
    option_groups: {
      sql: `${CUBE}.option_group_id = ${option_groups.id}`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    }
  },
  
  measures: {
    count: {
      type: `count`
    },
    
    additional_price: {
      sql: `additional_price`,
      type: `sum`
    },
    
    amount: {
      sql: `amount`,
      type: `sum`
    },
    
    price: {
      sql: `price`,
      type: `sum`
    },
    
    quantity: {
      sql: `quantity`,
      type: `sum`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
