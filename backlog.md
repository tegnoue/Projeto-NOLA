### Backlog do Produto

| Épico | ID | História de Usuário / Tarefa Técnica | Dor(es) Relacionada(s) | Critérios de Aceitação | Prioridade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Fundação Técnica | T01 | [Técnico] Configurar ambiente (PostgreSQL + Gerador de Dados) | Todas | • `docker compose up` funciona.<br>• Banco populado com +500k vendas. | P0 |
| Fundação Técnica | T02 | [Técnico] Configurar Camada Analítica (ex: Cube.js) e Frontend (Next.js) | D09 (Performance) | • Camada analítica conectada ao PostgreSQL.<br>• Frontend conectado à API analítica.<br>• Decisão arquitetural documentada. | P0 |
| Dashboard (MVP) | US01 | Como Maria, eu quero ver os KPIs principais (Faturamento, Vendas, Ticket Médio). | D07, D08 | • Métricas corretas.<br>• Carregamento em \< 500ms.<br>• UX intuitiva e Mobile-friendly. | P0 |
| Dashboard (MVP) | US02 | Como Maria, eu quero um seletor de período de datas global. | D07, D08, D09 | • Filtro de data atualiza todos os gráficos.<br>• Carregamento em \< 500ms. | P0 |
| Dashboard (MVP) | US03 | Como Maria, eu quero ver um ranking de "Top 10 Produtos Mais Vendidos". | D08 (Crit. Sucesso \#2) | • Ranking correto.<br>• Carregamento em \< 500ms.<br>• Mobile-friendly. | P0 |
| Dashboard (MVP) | US04 | Como Maria, eu quero um filtro de Lojas global. | D09 (Crit. Sucesso \#3), D02 | • Permite comparar lojas.<br>• Todos os gráficos são atualizados.<br>• Carregamento em \< 500ms. | P0 |
| Exploração Flexível | US05 | Como Maria, eu quero poder exportar meu dashboard ou um gráfico (ex: PDF/CSV), para que eu possa apresentar os dados ao meu sócio. | "Critério de Sucesso \#4" | • A exportação deve refletir os filtros atuais.<br>• Deve ser uma ação intuitiva (ex: um botão "Exportar"). | P1 |
| Exploração Flexível | US06 | Como Maria, eu quero poder ver vendas por Dia da Semana e Hora do Dia. | D01, D04 | • Permite responder "quinta à noite".<br>• Acessibilidade básica. | P1 |
| Exploração Flexível | US07 | Como Maria, eu quero visualizar métricas operacionais, principalmente relacionadas a entregas. | D04 | • Usa os campos `production_seconds` e `delivery_seconds`. | P1 |
| Exploração Flexível | US08 | Como Maria, eu quero poder criar minha própria análise (salvar gráfico). | D06, D07 | • Resolve o desafio central de "explorar dados livremente". | P1 |
| Análises Avançadas | US09 | Como Maria, eu quero ver um ranking de itens/complementos. | D10 (Implícita) | • Usa a tabela `item_product_sales`. | P2 |
| Análises Avançadas | US10 | Como Maria, eu quero ver um relatório de Taxa de Cancelamento e motivos. | Dores Implícitas (Checklist) | • Usa o `sale_status_desc = 'CANCELLED'`. | P2 |
| Análises Avançadas | US11 | Como Maria, eu quero um relatório simples de clientes. | D05 | • Filtra clientes por recência e frequência de compra. | P2 |
| Análises Avançadas | US12 | Como Maria, eu quero que o sistema detecte e destaque anomalias (picos/quedas) no faturamento. | D12 (Implícita), "Insights/IA" | • Deve identificar a "Semana problemática" e o "Dia promocional". | P2 |
| Qualidade Técnica | T03 | [Técnico] Implementar testes automatizados para as métricas de negócio. | "Code quality: testes" | • "Pontos Extras: Testes automatizados".<br>• Código testável (SOLID, DRY). | P2 |
| Qualidade Técnica | T04 | [Técnico] Fazer o deploy funcional em cloud (ex: Vercel, Railway). | "Entrega" | • "Não obrigatório, mas valorizado." | P2 |