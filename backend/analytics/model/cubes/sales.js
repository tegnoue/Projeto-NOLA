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
    
    delivery_fee: {
      sql: `delivery_fee`,
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
    
    service_tax_fee: {
      sql: `service_tax_fee`,
      type: `string`
    },
    
    total_amount: {
      sql: `total_amount`,
      type: `string`
    },
    
    total_amount_items: {
      sql: `total_amount_items`,
      type: `string`
    },
    
    total_discount: {
      sql: `total_discount`,
      type: `string`
    },
    
    total_increase: {
      sql: `total_increase`,
      type: `string`
    },
    
    value_paid: {
      sql: `value_paid`,
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

    customer_id: {
      sql: `customer_id`,
      type: `number`
    },
  },
  
  measures: {
    count: {
      type: `count`
    },

    total_clientes: {
      type: `countDistinct`,
      sql: `customer_id`,
      title: "Clientes Únicos"
    },

    avg_ticket: {
      type: `avg`,
      sql: `total_amount`,
      format: `currency`
    },

    invoicing: {
      type: `sum`,
      sql: 'total_amount',
      format: `currency`
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
      format: `percent`,
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
      format: `currency`,
      title: "Gasto Total (LTV)"
    },
    
    days_since_last_purchase: {
      type: `number`,
      sql: `DATE_PART('day', NOW() - MAX(${CUBE}.created_at))`,
      title: "Dias desde a Última Compra"
    }
  },
  
preAggregations: {
    main: {
      type: `rollup`,

      measures: [
        sales.count,
        sales.invoicing,
        sales.avg_prep_time,
        sales.avg_delivery_time,
        sales.count_cancelled,
        sales.cancellation_rate,
        sales.frequency,
        sales.ltv,
        sales.days_since_last_purchase,
        item_product_sales.revenue,
        item_product_sales.times_added 
      ],

      dimensions: [
        sales.sale_status_desc,
        sales.hourOfDay,
        sales.dayOfWeek,
        stores.name,
        stores.is_own,
        stores.city,
        stores.sub_brand_id,
        products.name,
        items.name,
        delivery_addresses.neighborhood,
        customers.customer_name,
        channels.name
      ],
      
      timeDimension: sales.created_at,
      granularity: `day`
    }
  }
  
});
