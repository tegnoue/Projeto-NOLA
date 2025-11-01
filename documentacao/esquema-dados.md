# Esquema de Analytics

Sale (Venda) [sales]
├── Store (Loja) [stores] (store_id)
├── Channel (Canal) [channels] (channel_id)
│
├── ProductSales[] (Produtos da Venda) [product_sales] (sales.id -> product_sales.sale_id)
│   ├── Product (O produto em si) [products] (product_sales.product_id -> products.id)
│   └── ItemProductSales[] (Customizações) [item_product_sales] (product_sales.id -> item_product_sales.product_sale_id)
│       └── Item (O item de customização) [items] (item_product_sales.item_id -> items.id)
│
└── DeliverySale (Entrega) [delivery_sales] (sales.id -> delivery_sales.sale_id)
    └── DeliveryAddress (Endereço) [delivery_addresses]