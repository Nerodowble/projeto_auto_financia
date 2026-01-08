# FinAuto Hub - Backend

Este é o backend para o sistema FinAuto Hub, uma aplicação web para cotação automatizada de financiamento de veículos.

## Visão Geral

O FinAuto Hub visa automatizar o processo de cotação de financiamento de veículos para concessionárias. O sistema permite que um vendedor insira os dados do cliente e do veículo uma única vez, e o backend consulta várias instituições financeiras simultaneamente, retornando propostas consolidadas.

## Tecnologias Sugeridas

- **Linguagem:** Node.js (TypeScript)
- **Framework da API:** Express.js
- **Automação:** Playwright
- **Banco de Dados:** PostgreSQL
- **Fila de Jobs:** BullMQ + Redis
- **Autenticação:** JWT

## Estrutura do Projeto (Proposta)

```
/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── clientes.routes.ts
│   │   │   ├── veiculos.routes.ts
│   │   │   ├── simulacoes.routes.ts
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── services/
│   ├── config/
│   ├── core/
│   │   ├── enums/
│   │   └── interfaces/
│   ├── jobs/
│   │   ├── workers/
│   │   └── queues.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── utils/
│   └── app.ts
├── package.json
├── tsconfig.json
└── .env
```

## Como Começar

### Pré-requisitos

- Node.js (v18+)
- Docker (para PostgreSQL e Redis)
- Git

### Instalação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd backend_finautohub
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis de ambiente.

4. Inicie os contêineres do Docker:
   ```bash
   docker-compose up -d
   ```

5. Execute as migrações do banco de dados:
   ```bash
   npm run db:migrate
   ```

### Executando a Aplicação

```bash
# Modo de desenvolvimento
npm run dev

# Modo de produção
npm start