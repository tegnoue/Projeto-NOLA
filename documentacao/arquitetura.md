## ARQUITETURA DO PROJETO
Esse projeto terá a arquitetura em camadas e será desenvolvido visando o desacoplamento entre estas e garantindo que as requisições sigam processos bem definidos para que não haja "perda de desempenho" em camadas não adequadas. A decisão por essa arquitetura em específico foi tomada pensando nas boas práticas de cosntrução/manutenção do software onde, nesse caso, a ideia é isolar as responsabilidades de cada camada e garantir que as camadas se comuniquem por abstrações.  

Dentro do escopo do projeto de Analytics para restaurantes, o objetivo é construir uma aplicação analítica sobre um banco de dados já existente. O design do projeto é guiado por 3 pontos essenciais:

1.  A interface e experiência do usuário, ou UX/UI, precisa ser simples, intuitiva, organizada e efetiva, além de, preferencialmente, responsiva (mobile-friendly).
2.  Os Dados não devem ser rígidos, ou seja, Maria (ou outros usuários) deve poder personalizar as exibições e criar visualizações baseado em suas necessidades ou questionamentos. O mais importante é que a ferramenta responda o máximo de perguntas que um usuário possa ter.
3.  Quanto à Performance, o desafio é que o armazenamento (PostgreSQL) é um banco não otimizado para análises. A arquitetura deve superar essa limitação e ser veloz (para os requisitos do projeto entregar em menos de 2s e, preferencialmente em <=500ms).

Tendo em vista esses pontos, tomei as seguintes decisões e cheguei às seguintes conclusões:

### CAMADA DE VISUALIZAÇÃO (FRONTEND)

Como tecnologia para frontend utilizarei o Next.js, pois além da familiaridade com a tecnologia, ela tem bibliotecas que pode auxiliar na construção do dashboard e facilita a criação de visuais elegantes e intuitivos.

A ideia aqui é apenas receber/pedir os dados que virão da próxima camada.

### CAMADA ANALÍTICA (BACKEND)

Nesta camada a estratégia é utilizar materializações ou pré-agregações, sendo assim, seguir uma abordagem tradicional de backend (usando Django por exemplo) não seria a mais adequada por não ter enfoque no tratamento de dados (cada filtro no dashboard da exigiria JOINs pesados em 500k linhas, levando segundos para carregar,). Para esta camada, a tecnologia a ser utilizada será o Cube.js, ferramenta open-source de análise de dados, com ele será possível criar pré-agregações assim tornando a performance mais ágil.

**obs:** Outra tecnologia plausível para a camada analítica seria o dbt, mas o Cube.js funciona como uma ferramenta única, enquanto o dbt precisaria ser utilizado com uma API, o que não é necessariamente ruim, mas levando em consideração o tempo de entrega, foi um fator levado em consideração.

### CAMADA DE ARMAZENAMENTO (Banco de Dados)

A tecnologia já definida é o PostgreSQL, que atua como nosso banco de dados transacional (OLTP). A arquitetura foi desenhada para não sobrecarregá-lo com queries analíticas pesadas, delegando essa responsabilidade de otimização (via pré-agregações) para a Camada Analítica (Cube.js).

```
      [ Utilizador (Maria) ]
               |
               v (Interage com a UI no Navegador)
      +--------------------------+
      |  Componente 1: Frontend  |
      |  (Next.js + Recharts)    |
      |  (Gráficos, Filtros, UI) |
      +--------------------------+
               |
               v (Pede métricas, ex: "Faturamento por Loja")
               | (API via HTTP/GraphQL)
      +--------------------------+
      |  Componente 2: Backend   |
      |  Analítico (Cube.js)     |
      |  (Gera SQL, Cache,       |
      |   Pré-agregações)        |
      +--------------------------+
               |
               v (Executa query SQL otimizada)
      +--------------------------+
      |  Componente 3: Banco de  |
      |  Dados (PostgreSQL)      |
      |  (+500k Vendas Brutas)   |
      +--------------------------+
```