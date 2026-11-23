# Escopo do projeto — Sistema de Agendamento para Barbearias

## Proposta

Desenvolver um novo site e uma API para conectar clientes a barbeiros. Clientes poderão consultar barbeiros, serviços e horários disponíveis e solicitar um agendamento. Barbeiros poderão gerenciar seus serviços, disponibilidade e solicitações de agendamento. 

## Objetivo da primeira versão (MVP)

Entregar um fluxo funcional do início ao fim, com frontend consumindo uma API TypeScript, dados persistidos em banco de dados e demonstração possível pelo Swagger.

### Para clientes

- Criar conta e fazer login.
- Consultar a lista de barbeiros e seus serviços.
- Consultar horários disponíveis.
- Solicitar um agendamento para um barbeiro, serviço e horário.
- Consultar e cancelar seus próprios agendamentos.

### Para barbeiros

- Criar conta e fazer login.
- Cadastrar, consultar, editar e remover seus serviços.
- Cadastrar e consultar horários disponíveis; editar ou remover horários quando necessário.
- Consultar solicitações de agendamento e confirmar ou cancelar atendimentos.
- Consultar apenas os dados e agendamentos vinculados à própria conta.

## Regras essenciais

- Deve haver dois perfis: cliente e barbeiro.
- Senhas não podem ser armazenadas em texto puro.
- O login retorna um JWT; as rotas da aplicação exigem token válido e autorização adequada ao perfil.
- Cadastro e login são exceções à autenticação obrigatória, pois são necessários para obter o token.
- Um cliente só pode consultar ou cancelar os próprios agendamentos.
- Um barbeiro só pode alterar seus próprios serviços, horários e agendamentos.
- Um horário não pode ser reservado por mais de um agendamento ativo ao mesmo tempo.
- Os dados apresentados no site devem vir da API e do banco, não de listas fixas no frontend.

## Requisitos técnicos incluídos

- API em TypeScript.
- Sequelize ou TypeORM para persistência.
- JWT para autenticação e controle de acesso.
- Swagger para documentar e testar a API.
- Docker para executar a aplicação e o banco em ambiente padronizado.
- GitHub Actions para publicação automática do frontend e da API.
- README com proposta, instruções locais e endereços publicados.

## Fora do escopo da primeira versão

- Pagamentos online, repasses ou comissões.
- Notificações por WhatsApp, SMS ou e-mail.
- Avaliações e comentários de clientes.
- Aplicativos nativos para celular.
- Múltiplas unidades e gestão avançada de equipe.

## Critérios de aceite do projeto

1. Um cliente consegue criar conta, entrar e obter um JWT.
2. Um barbeiro consegue criar conta, entrar e obter um JWT.
3. O cliente autenticado consegue consultar barbeiros, serviços e horários disponíveis.
4. O cliente consegue solicitar um agendamento e consultar seus próprios agendamentos.
5. O barbeiro autenticado consegue gerenciar seus serviços e horários e tratar agendamentos.
6. A API valida autenticação, permissões e conflitos de horário.
7. As rotas principais estão documentadas e testáveis no Swagger.
8. Uma alteração feita pela API/Swagger aparece no site após atualizar os dados.
9. Frontend e API estão publicados, comunicam-se pela rede e não dependem do computador de um integrante.
10. A aplicação e o banco podem ser iniciados com Docker seguindo o README.

## Prioridade de entrega

1. Estrutura da API, banco, modelos e autenticação.
2. Cadastro/login dos dois perfis e proteção das rotas.
3. Serviços, horários e listagem de barbeiros.
4. Solicitação e gerenciamento de agendamentos, incluindo validação de conflito.
5. Integração com o frontend e documentação Swagger.
6. Docker, publicação, README e ensaio da demonstração.

