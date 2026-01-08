# DOCUMENTAÇÃO TÉCNICA - FinAuto Hub Backend

## 1. Visão Geral do Projeto

O backend do FinAuto Hub é responsável por receber as solicitações de cotação de financiamento de veículos, processá-las de forma automatizada consultando os portais de múltiplas instituições financeiras e retornar os resultados de forma consolidada para o frontend.

### 1.1 Objetivo

O objetivo principal é criar uma API RESTful robusta, escalável e segura que sirva como núcleo para a plataforma FinAuto Hub, automatizando um processo tradicionalmente manual e demorado.

### 1.2 Tecnologias Utilizadas

- **Linguagem:** TypeScript
- **Ambiente de Execução:** Node.js
- **Framework da API:** Express.js
- **Automação (Web Scraping):** Playwright
- **Banco de Dados:** SQLite (via Prisma)
- **Fila de Jobs:** BullMQ + Redis (planejado)
- **Autenticação:** JWT (placeholder)

---

## 2. Estrutura do Projeto

A estrutura de pastas foi organizada para promover a modularidade, separação de responsabilidades e escalabilidade.

```
/
├── docs/
│   └── DOCUMENTACAO_TECNICA.md
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── node_modules/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── clientes.routes.ts
│   │   │   ├── veiculos.routes.ts
│   │   │   ├── simulacoes.routes.ts
│   │   │   └── index.ts  (Agregador de rotas)
│   │   ├── controllers/ (Lógica de requisição/resposta)
│   │   ├── middlewares/ (Funções intermediárias)
│   │   └── services/    (Lógica de negócio)
│   ├── config/          (Configurações da aplicação)
│   ├── core/
│   │   ├── enums/       (Enumeradores e tipos)
│   │   └── interfaces/  (Contratos de dados)
│   ├── jobs/
│   │   ├── spiders/
│   │   ├── workers/     (Processadores de jobs da fila)
│   │   └── queues.ts    (Definição das filas)
│   ├── database/
│   │   ├── migrations/  (Scripts de evolução do schema)
│   │   └── seed.ts     (Script para popular o BD)
│   ├── utils/           (Funções utilitárias)
│   └── app.ts           (Ponto de entrada da aplicação Express)
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 3. Funcionalidades Implementadas

- **Autenticação de Usuários:** Sistema de login funcional que retorna um token (placeholder), `lojaId` e `usuarioId`.
- **Cadastro de Clientes e Veículos:** Endpoints para criação, listagem, atualização e exclusão de clientes e veículos, com lógica de multi-tenancy (vinculado à `lojaId`).
- **Simulação de Financiamento:** Endpoint para iniciar uma simulação, vinculada a um cliente, veículo, usuário e loja.
- **Banco de Dados com SQLite:** Configuração completa do Prisma com SQLite, incluindo migrações e script de seed para popular o banco com dados iniciais.
- **CORS:** Configuração para permitir requisições do frontend.

---

## 4. API Endpoints

A API é prefixada com `/api`.

### 4.1 Autenticação (`/api/auth`)
- `POST /login`: Realiza o login do usuário. Retorna um token, `lojaId` e `usuarioId`.
- `POST /register`: Registra um novo usuário (não implementado).
- `GET /me`: Retorna os dados do usuário autenticado (não implementado).

### 4.2 Clientes (`/api/clientes`)
- `GET /?lojaId={id}`: Lista todos os clientes de uma loja específica.
- `GET /:id`: Busca um cliente por ID.
- `POST /`: Cria um novo cliente. O `lojaId` deve ser enviado no corpo da requisição.
- `PUT /:id`: Atualiza um cliente existente.
- `DELETE /:id`: Remove um cliente.

### 4.3 Veículos (`/api/veiculos`)
- `GET /?lojaId={id}`: Lista todos os veículos de uma loja específica.
- `GET /:id`: Busca um veículo por ID.
- `POST /`: Adiciona um novo veículo. O `lojaId` deve ser enviado no corpo da requisição.
- `PUT /:id`: Atualiza um veículo existente.
- `DELETE /:id`: Remove um veículo.

### 4.4 Simulações (`/api/simulacoes`)
- `GET /`: Retorna o histórico de simulações.
- `GET /:id`: Detalhes de uma simulação específica.
- `POST /`: Dispara uma nova simulação de financiamento. O `lojaId` e `usuarioId` devem ser enviados no corpo da requisição.

---

## 5. Configuração e Execução

### 5.1 Pré-requisitos
- Node.js (versão 18 ou superior)
- Git

### 5.2 Instalação
1.  Clone o repositório.
2.  Navegue até a pasta do projeto: `cd backend_finautohub`
3.  Instale as dependências: `npm install`
4.  Crie um arquivo `.env` na raiz do projeto com o conteúdo: `DATABASE_URL="file:./dev.db"`
5.  Execute as migrações e o seed do banco de dados:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

### 5.3 Scripts
- **Desenvolvimento:** `npm run dev`
  - Inicia o servidor com `ts-node-dev`, que reinicia automaticamente a cada alteração de código.
- **Build:** `npm run build`
  - Compila o código TypeScript para JavaScript (gerando uma pasta `dist`).

---

## 6. Próximos Passos (Roadmap)

1.  **Autenticação JWT:** Substituir o token placeholder por um sistema completo de geração e validação de tokens JWT.
2.  **Motor de Automação:** Criar o sistema de jobs com BullMQ e desenvolver os workers com Playwright para os primeiros portais de bancos.
3.  **Testes:** Adicionar testes unitários e de integração para garantir a qualidade do código.
4.  **Spider Santander:** Finalizar o desenvolvimento do spider do Santander.
5.  **Inserção de Dados do Spider:** Criar um script para inserir os dados extraídos pelo spider no banco de dados.
