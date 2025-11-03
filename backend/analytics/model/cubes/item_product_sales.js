cube(`item_product_sales`, {
  sql_table: `public.item_product_sales`,
  
  data_source: `default`,
  
  joins: {
    items: {
      sql: `${CUBE}.item_id = ${items.id}`,
      relationship: `many_to_one`
    },
    
    option_groups: {
      sql: `${CUBE}.option_group_id = ${option_groups.id}`,
      relationship: `many_to_one`
    },
    
    item_item_product_sales: {
      sql: `${CUBE}.product_sale_id = ${item_item_product_sales.id}`,
      relationship: `many_to_one`
    },
    
    product_sales: {
      sql: `${CUBE}.product_sale_id = ${product_sales.id}`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },

    product_sale_id: {
      sql: `product_sale_id`,
      type: `number`
    },

    item_id: {
      sql: `item_id`,
      type: `number`
    },
    count_added: {
  type: `count`,
  title: "Itens Adicionados (Qtd)",
  filters: [
    { sql: `${option_groups}.name = 'Adicionais'` }
  ]
},

    count_removed: {
  type: `count`,
  title: "Itens Removidos (Qtd)",
  filters: [
    { sql: `${option_groups}.name = 'Remover'` }
  ]
},

    observations: {
      sql: `observations`,
      type: `string`
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
    },

    times_added: {
      type: `count`,
      sql: `id`
    },
    revenue: {
      type: `sum`,
      sql: `additional_price`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
