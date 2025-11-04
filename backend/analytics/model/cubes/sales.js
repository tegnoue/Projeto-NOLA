cube(`sales`, {
  sql_table: `public.sales`,
  
  data_source: `default`,
  
  joins: {
    channels: {
      sql: `${CUBE}.channel_id = ${channels.id}`,
      relationship: `many_to_one`
    },
    
    customers: {
      sql: `${CUBE}.customer_id = ${customers.id}`,
      relationship: `many_to_one`
    },
    
    stores: {
      sql: `${CUBE}.store_id = ${stores.id}`,
      relationship: `many_to_one`
    },
    
    sub_brands: {
      sql: `${CUBE}.sub_brand_id = ${sub_brands.id}`,
      relationship: `many_to_one`
    },

    product_sales: {
      sql: `${CUBE}.id = ${product_sales.sale_id}`,
      relationship: `hasMany`
    },

    delivery_sales: {
      sql: `${CUBE}.id = ${delivery_sales}.sale_id`,
      relationship: `hasOne`
    },
    
    // ADICIONADO: Join para o gráfico de pagamentos
    payments: {
      sql: `${CUBE}.id = ${payments.sale_id}`,
      relationship: `hasMany`
    }
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    sub_brand_id: {
      sql: `sub_brand_id`,
      type: `number`
    },

    channel_id: {
      sql: `channel_id`,
      type: `number`
    },

    cod_sale1: {
      sql: `cod_sale1`,
      type: `string`
    },
    
    cod_sale2: {
      sql: `cod_sale2`,
      type: `string`
    },
    
    customer_name: {
      sql: `customer_name`,
      type: `string`
    },
    
    discount_reason: {
      sql: `discount_reason`,
      type: `string`
    },
    
    increase_reason: {
      sql: `increase_reason`,
      type: `string`
    },
    
    origin: {
      sql: `origin`,
      type: `string`
    },
    
    sale_status_desc: {
      sql: `sale_status_desc`,
      type: `string`
    },
    
    created_at: {
      sql: `created_at`,
      type: `time`
    },

    hourOfDay: {
      sql: `EXTRACT(HOUR FROM ${CUBE}.created_at)`,
      type: `number`
    },

    dayOfWeek: {
      sql: `EXTRACT(DOW FROM ${CUBE}.created_at)`,
      type: `number`
    },

    store_id: {
      sql: `store_id`,
      type: `number`
    },
        
    month: {
      sql: `TO_CHAR(${CUBE}.created_at, 'YYYY-MM')`, // Formato '2025-09'
      type: `string`
    },

    customer_id: {
      sql: `customer_id`,
      type: `number`
    },
  },
  
  measures: {
    count: {
      type: `count`
    },

    delivery_fee: {
      sql: `delivery_fee`,
      type: `sum`
    },
    service_tax_fee: {
      sql: `service_tax_fee`,
      type: `sum`
    },
    total_amount: {
      sql: `total_amount`,
      type: `sum`
    },
    total_amount_items: { 
      sql: `total_amount_items`,
      type: `sum`
    },
    total_increase: {
      sql: `total_increase`,
      type: `sum`
    },
    value_paid: {
      sql: `value_paid`,
      type: `sum`
    },
    total_discount: {
      type: `sum`,
      sql: `total_discount`
    },
    // --- FIM DAS MEDIDAS FINANCEIRAS ---

    total_clientes: {
      type: `countDistinct`,
      sql: `customer_id`,
      title: "Clientes Únicos"
    },

    avg_ticket: {
      type: `avg`,
      sql: `total_amount` // total_amount é o 'invoicing'
    },

    invoicing: { // MANTIDO: 'invoicing' como sinônimo de 'total_amount'
      type: `sum`,
      sql: 'total_amount'
    },
    
    people_quantity: {
      sql: `people_quantity`,
      type: `sum`
    },

    avg_prep_time: {
      type: `avg`,
      sql: `${CUBE}.production_seconds / 60`,
      format: `number`,
      title: `Tempo Médio de Preparo (min)`
    },
    avg_delivery_time: {
      type: `avg`,
      sql: `${CUBE}.delivery_seconds / 60`,
      format: `number`,
      title: `Tempo Médio de Entrega (min)`
    },

    count_cancelled: {
      type: `count`,
      title: `Vendas Canceladas`,
      filters: [
        {
          sql: `${CUBE}.sale_status_desc = 'CANCELLED'`
        }
      ]
    },
    
    cancellation_rate: {
      type: `number`,
      sql: `(${count_cancelled}::float / ${count}::float)`,
      title: `Taxa de Cancelamento`
    },

    frequency: {
      type: `countDistinct`,
      sql: `id`,
      title: "Nº de Compras"
    },
    
    ltv: {
      type: `sum`,
      sql: `total_amount`,
      title: "Gasto Total (LTV)"
    },
    
    days_since_last_purchase: {
      type: `number`,
      sql: `DATE_PART('day', NOW() - MAX(${CUBE}.created_at))`,
      title: "Dias desde a Última Compra"
    },
    discount_percentage:{
      type: `number`,
      sql: `CASE WHEN ${total_amount_items} = 0 THEN 0 ELSE ${total_discount}::float / ${total_amount_items}::float END`
    }
  },
  

  preAggregations: {
    main: {
      type: `rollup`,
      measures: [
        sales.count,
        sales.total_clientes,
        sales.avg_ticket,
        sales.invoicing,
        sales.total_amount_items, // Adicionada
        sales.people_quantity,
        sales.avg_prep_time,
        sales.avg_delivery_time,
        sales.count_cancelled,
        sales.cancellation_rate,
        sales.frequency,
        sales.ltv,
        sales.days_since_last_purchase,
        sales.total_discount,
        sales.discount_percentage
      ],
      dimensions: [
        sales.sale_status_desc,
        sales.discount_reason,
        sales.hourOfDay,
        sales.dayOfWeek,
        sales.month,
        sales.store_id,
        sales.customer_id,
        sales.channel_id,
        sales.sub_brand_id
      ],
      timeDimension: sales.created_at,
      granularity: `day`
    }
  }
});
