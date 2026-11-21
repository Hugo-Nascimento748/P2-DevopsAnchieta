import { Agendamento } from './Agendamento'
import { Disponibilidade } from './Disponibilidade'
import { Servico } from './Servico'
import { Usuario } from './Usuario'

Usuario.hasMany(Servico, { as: 'servicos', foreignKey: 'barbeiroId' })
Servico.belongsTo(Usuario, { as: 'barbeiro', foreignKey: 'barbeiroId' })

Usuario.hasMany(Disponibilidade, { as: 'disponibilidades', foreignKey: 'barbeiroId' })
Disponibilidade.belongsTo(Usuario, { as: 'barbeiro', foreignKey: 'barbeiroId' })

Usuario.hasMany(Agendamento, { as: 'agendamentosComoCliente', foreignKey: 'clienteId' })
Agendamento.belongsTo(Usuario, { as: 'cliente', foreignKey: 'clienteId' })

Usuarioimport { Agendamento } from './Agendamento'
import { Disponibilidade } from './Disponibilidade'
import { Servico } from './Servico'
import { Usuario } from './Usuario'


const restrito = { onDelete: 'RESTRICT', onUpdate: 'CASCADE' } as const

Usuario.hasMany(Servico, { as: 'servicos', foreignKey: 'barbeiroId', ...restrito })
Servico.belongsTo(Usuario, { as: 'barbeiro', foreignKey: 'barbeiroId' })

Usuario.hasMany(Disponibilidade, { as: 'disponibilidades', foreignKey: 'barbeiroId', ...restrito })
Disponibilidade.belongsTo(Usuario, { as: 'barbeiro', foreignKey: 'barbeiroId' })

Usuario.hasMany(Agendamento, { as: 'agendamentosComoCliente', foreignKey: 'clienteId', ...restrito })
Agendamento.belongsTo(Usuario, { as: 'cliente', foreignKey: 'clienteId' })

Usuario.hasMany(Agendamento, { as: 'agendamentosComoBarbeiro', foreignKey: 'barbeiroId', ...restrito })
Agendamento.belongsTo(Usuario, { as: 'barbeiro', foreignKey: 'barbeiroId' })

Servico.hasMany(Agendamento, { as: 'agendamentos', foreignKey: 'servicoId', ...restrito })
Agendamento.belongsTo(Servico, { as: 'servico', foreignKey: 'servicoId' })

export { Agendamento, Disponibilidade, Servico, Usuario }
export { StatusAgendamento } from './Agendamento'
export { TipoUsuario } from './Usuario'
.hasMany(Agendamento, { as: 'agendamentosComoBarbeiro', foreignKey: 'barbeiroId' })
Agendamento.belongsTo(Usuario, { as: 'barbeiro', foreignKey: 'barbeiroId' })

Servico.hasMany(Agendamento, { as: 'agendamentos', foreignKey: 'servicoId' })
Agendamento.belongsTo(Servico, { as: 'servico', foreignKey: 'servicoId' })

export { Agendamento, Disponibilidade, Servico, Usuario }
