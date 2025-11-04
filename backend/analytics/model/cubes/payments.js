cube('payments', {
  sql_table: 'public.payments',

  joins: {
    payment_types: {
      sql: `${CUBE}.payment_type_id = ${payment_types.id}`,
      relationship: 'many_to_one'
    },
    
    sales: {
      sql: `${CUBE}.sale_id = ${sales.id}`,
      relationship: 'many_to_one'
    }
  },

  measures: {
    count: {
      type: 'count'
    },
    
    value: {
      sql: 'value',
      type: 'sum'
    }
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'number',
      primary_key: true
    },
    
    value_paid: {
      sql: 'value',
      type: 'number'
    }
  }
});
