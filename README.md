# Sistema de Agendamento para Barbearias

Projeto acadêmico com site para clientes e barbeiros e uma API para autenticação e gerenciamento de agendamentos.

## Organização

- `frontend/`: páginas estáticas, estilos e integração HTTP.
- `backend/`: API em TypeScript, Express, Sequelize, PostgreSQL e JWT.
- `ESCOPO.md`: escopo e critérios de aceite.
- `backend/_archive/legacy-prisma/`: arquivos antigos do protótipo Prisma, preservados para consulta; não fazem parte da aplicação ativa.

## Executar a API localmente

Requisitos: Node.js e PostgreSQL.

1. Abra um terminal na pasta `backend` e execute `npm install`.
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` e `JWT_SECRET`.
3. Execute `npm run dev`.
4. A API ficará disponível em `http://localhost:3000`.

Rotas de autenticação disponíveis:

- `POST /auth/cadastro`
- `POST /auth/login`
- `GET /auth/perfil` (requer JWT)

O frontend ainda contém modo de simulação local. Desative-o ao validar a integração real. Rotas de barbeiros, serviços, disponibilidades e agendamentos, Swagger, Docker e publicação ainda precisam ser implementados.
