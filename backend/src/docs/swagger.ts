/**
 * Documentação OpenAPI 3 da API da Barbearia.
 * Disponível em /docs (Swagger UI) e /docs.json (especificação bruta).
 *
 * Ao criar ou alterar uma rota, atualize também este arquivo.
 */

const uuid = { type: 'string', format: 'uuid' }
const dataHora = { type: 'string', format: 'date-time', example: '2026-12-01T13:00:00.000Z' }

const erro = (descricao: string) => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
})

const json = (schema: object, description = 'Sucesso') => ({
  description,
  content: { 'application/json': { schema } },
})

const ref = (nome: string) => ({ $ref: `#/components/schemas/${nome}` })
const lista = (nome: string) => ({ type: 'array', items: ref(nome) })
const pathId = { name: 'id', in: 'path', required: true, schema: uuid }

const respostasProtegidas = {
  401: erro('Token ausente, inválido ou expirado'),
  500: erro('Erro interno do servidor'),
}

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'API — Sistema de Agendamento para Barbearias',
    version: '1.0.0',
    description:
      'API do projeto P2 (DevOps — Anchieta). Para testar rotas protegidas: ' +
      '1) cadastre um usuário em POST /auth/cadastro; 2) faça login em POST /auth/login; ' +
      '3) copie o `token` e clique em **Authorize** (cadeado) informando apenas o token.',
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    { name: 'Status' },
    { name: 'Autenticação' },
    { name: 'Barbeiros' },
    { name: 'Serviços' },
    { name: 'Disponibilidades' },
    { name: 'Agendamentos' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Erro: {
        type: 'object',
        properties: { erro: { type: 'string' }, mensagem: { type: 'string' } },
      },
      TipoUsuario: { type: 'string', enum: ['CLIENTE', 'BARBEIRO'] },
      StatusAgendamento: {
        type: 'string',
        enum: ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'],
      },
      UsuarioPublico: {
        type: 'object',
        properties: {
          id: uuid,
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          telefone: { type: 'string', nullable: true },
          tipo: ref('TipoUsuario'),
        },
      },
      CadastroInput: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', example: 'João da Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          senha: { type: 'string', minLength: 8, example: 'senha1234' },
          telefone: { type: 'string', nullable: true, example: '11999999999' },
          tipo: { type: 'string', enum: ['CLIENTE', 'BARBEIRO'], default: 'CLIENTE' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          senha: { type: 'string', example: 'senha1234' },
        },
      },
      LoginResposta: {
        type: 'object',
        properties: {
          mensagem: { type: 'string' },
          token: { type: 'string' },
          usuario: ref('UsuarioPublico'),
        },
      },
      Servico: {
        type: 'object',
        properties: {
          id: uuid,
          barbeiroId: uuid,
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          duracaoMinutos: { type: 'integer' },
          preco: { type: 'number' },
          ativo: { type: 'boolean' },
        },
      },
      ServicoInput: {
        type: 'object',
        required: ['barbeiroId', 'nome', 'duracaoMinutos', 'preco'],
        properties: {
          barbeiroId: uuid,
          nome: { type: 'string', example: 'Corte masculino' },
          descricao: { type: 'string', nullable: true, example: 'Corte na tesoura e máquina' },
          duracaoMinutos: { type: 'integer', minimum: 1, example: 30 },
          preco: { type: 'number', minimum: 0, example: 45 },
        },
      },
      ServicoUpdate: {
        type: 'object',
        description: 'Envie apenas os campos que deseja alterar.',
        properties: {
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          duracaoMinutos: { type: 'integer', minimum: 1 },
          preco: { type: 'number', minimum: 0 },
          ativo: { type: 'boolean' },
        },
      },
      Barbeiro: {
        type: 'object',
        properties: {
          id: uuid,
          nome: { type: 'string' },
          telefone: { type: 'string', nullable: true },
          servicos: lista('Servico'),
        },
      },
      Disponibilidade: {
        type: 'object',
        properties: { id: uuid, barbeiroId: uuid, inicio: dataHora, fim: dataHora },
      },
      DisponibilidadeInput: {
        type: 'object',
        required: ['barbeiroId', 'inicio', 'fim'],
        properties: {
          barbeiroId: uuid,
          inicio: { ...dataHora, example: '2026-12-01T12:00:00.000Z' },
          fim: { ...dataHora, example: '2026-12-01T18:00:00.000Z' },
        },
      },
      HorarioLivre: {
        type: 'object',
        properties: { inicio: dataHora, fim: dataHora },
      },
      Agendamento: {
        type: 'object',
        properties: {
          id: uuid,
          clienteId: uuid,
          barbeiroId: uuid,
          servicoId: uuid,
          inicio: dataHora,
          fim: dataHora,
          status: ref('StatusAgendamento'),
        },
      },
      AgendamentoInput: {
        type: 'object',
        required: ['clienteId', 'barbeiroId', 'servicoId', 'inicio'],
        properties: { clienteId: uuid, barbeiroId: uuid, servicoId: uuid, inicio: dataHora },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/': {
      get: {
        tags: ['Status'],
        summary: 'Verifica se a API está online (usado no healthcheck do Docker)',
        security: [],
        responses: {
          200: json({
            type: 'object',
            properties: { mensagem: { type: 'string' }, status: { type: 'string' } },
          }),
        },
      },
    },
    '/auth/cadastro': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra cliente ou barbeiro',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: ref('CadastroInput') } } },
        responses: {
          201: json(
            { type: 'object', properties: { mensagem: { type: 'string' }, usuario: ref('UsuarioPublico') } },
            'Usuário criado',
          ),
          400: erro('Dados inválidos'),
          409: erro('E-mail já cadastrado'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica e retorna um JWT (válido por 2h)',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: ref('LoginInput') } } },
        responses: {
          200: json(ref('LoginResposta')),
          400: erro('Dados ausentes'),
          401: erro('Credenciais inválidas'),
        },
      },
    },
    '/auth/perfil': {
      get: {
        tags: ['Autenticação'],
        summary: 'Retorna os dados do token do usuário logado',
        responses: { 200: json({ type: 'object' }), ...respostasProtegidas },
      },
    },
    '/barbeiros': {
      get: {
        tags: ['Barbeiros'],
        summary: 'Lista barbeiros com seus serviços ativos',
        responses: { 200: json(lista('Barbeiro')), ...respostasProtegidas },
      },
    },
    '/barbeiros/{id}': {
      get: {
        tags: ['Barbeiros'],
        summary: 'Busca um barbeiro pelo id',
        parameters: [pathId],
        responses: { 200: json(ref('Barbeiro')), 404: erro('Barbeiro não encontrado'), ...respostasProtegidas },
      },
    },
    '/barbeiros/{id}/horarios-livres': {
      get: {
        tags: ['Barbeiros'],
        summary: 'Horários livres do barbeiro para um serviço em uma data',
        parameters: [
          pathId,
          { name: 'servicoId', in: 'query', required: true, schema: uuid },
          {
            name: 'data',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date', example: '2026-12-01' },
          },
        ],
        responses: {
          200: json(lista('HorarioLivre')),
          400: erro('Parâmetros inválidos'),
          ...respostasProtegidas,
        },
      },
    },
    '/servicos': {
      get: {
        tags: ['Serviços'],
        summary: 'Lista serviços',
        parameters: [
          { name: 'barbeiroId', in: 'query', schema: uuid },
          { name: 'incluirInativos', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { 200: json(lista('Servico')), ...respostasProtegidas },
      },
      post: {
        tags: ['Serviços'],
        summary: 'Cria um serviço para um barbeiro',
        requestBody: { required: true, content: { 'application/json': { schema: ref('ServicoInput') } } },
        responses: { 201: json(ref('Servico'), 'Criado'), 400: erro('Dados inválidos'), ...respostasProtegidas },
      },
    },
    '/servicos/{id}': {
      get: {
        tags: ['Serviços'],
        summary: 'Busca um serviço',
        parameters: [pathId],
        responses: { 200: json(ref('Servico')), 404: erro('Não encontrado'), ...respostasProtegidas },
      },
      put: {
        tags: ['Serviços'],
        summary: 'Atualiza um serviço',
        parameters: [pathId],
        requestBody: { required: true, content: { 'application/json': { schema: ref('ServicoUpdate') } } },
        responses: {
          200: json(ref('Servico')),
          400: erro('Dados inválidos'),
          404: erro('Não encontrado'),
          ...respostasProtegidas,
        },
      },
      delete: {
        tags: ['Serviços'],
        summary: 'Desativa um serviço (remoção lógica)',
        parameters: [pathId],
        responses: { 204: { description: 'Removido' }, 404: erro('Não encontrado'), ...respostasProtegidas },
      },
    },
    '/disponibilidades': {
      get: {
        tags: ['Disponibilidades'],
        summary: 'Lista disponibilidades',
        parameters: [
          { name: 'barbeiroId', in: 'query', schema: uuid },
          { name: 'data', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: json(lista('Disponibilidade')), ...respostasProtegidas },
      },
      post: {
        tags: ['Disponibilidades'],
        summary: 'Cadastra um intervalo de disponibilidade',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: ref('DisponibilidadeInput') } },
        },
        responses: {
          201: json(ref('Disponibilidade'), 'Criado'),
          400: erro('Dados inválidos'),
          409: erro('Sobreposição de horários'),
          ...respostasProtegidas,
        },
      },
    },
    '/disponibilidades/{id}': {
      delete: {
        tags: ['Disponibilidades'],
        summary: 'Remove uma disponibilidade',
        parameters: [pathId],
        responses: { 204: { description: 'Removido' }, 404: erro('Não encontrado'), ...respostasProtegidas },
      },
    },
    '/agendamentos': {
      get: {
        tags: ['Agendamentos'],
        summary: 'Lista agendamentos',
        parameters: [
          { name: 'barbeiroId', in: 'query', schema: uuid },
          { name: 'clienteId', in: 'query', schema: uuid },
          { name: 'data', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: json(lista('Agendamento')), ...respostasProtegidas },
      },
      post: {
        tags: ['Agendamentos'],
        summary: 'Solicita um agendamento',
        requestBody: { required: true, content: { 'application/json': { schema: ref('AgendamentoInput') } } },
        responses: {
          201: json(ref('Agendamento'), 'Criado'),
          400: erro('Dados inválidos ou horário no passado'),
          404: erro('Cliente, barbeiro ou serviço não encontrado'),
          409: erro('Conflito de horário ou fora da disponibilidade'),
          ...respostasProtegidas,
        },
      },
    },
    '/agendamentos/{id}/cancelar': {
      patch: {
        tags: ['Agendamentos'],
        summary: 'Cancela um agendamento',
        parameters: [pathId],
        responses: { 200: json(ref('Agendamento')), 404: erro('Não encontrado'), ...respostasProtegidas },
      },
    },
  },
}
