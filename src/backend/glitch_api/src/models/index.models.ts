// src/models/index.ts

import { sequelize } from '../config/database.config';

// Importa todos os models das subpastas
import * as PessoasModels from './pessoas/index.pessoas';
import * as TorneiosModels from './torneios/index.torneios';

// Consolida todos os models em um único objeto para fácil acesso
const models = {
  ...PessoasModels,
  ...TorneiosModels,
};

// Define um tipo para o objeto `models` para facilitar a tipagem
export type AppModels = typeof models;

/*
|--------------------------------------------------------------------------
| Definição das Associações
|--------------------------------------------------------------------------
| A regra principal é:
|   - A tabela que possui a chave estrangeira (foreignKey) usa .belongsTo()
|   - A tabela que é referenciada pela chave estrangeira usa .hasOne() ou .hasMany()
*/

// --- Associações de Pessoas ---

// Pessoas <-> Usuarios (1 para 1)
// A tabela 'usuarios' tem 'pessoa_id'
if (models.Usuarios && models.Pessoas) {
  models.Usuarios.belongsTo(models.Pessoas, { foreignKey: 'pessoa_id', as: 'pessoa' });
  models.Pessoas.hasOne(models.Usuarios, { foreignKey: 'pessoa_id', as: 'usuario' });
}

// Usuarios <-> Equipes (N para M)
// A associação é feita através da tabela 'membros_equipe'
if (models.Usuarios && models.Equipes && models.MembrosEquipe) {
  models.Usuarios.belongsToMany(models.Equipes, {
    through: models.MembrosEquipe,
    foreignKey: 'usuario_id',
    otherKey: 'equipe_id',
    as: 'equipes',
  });
  models.Equipes.belongsToMany(models.Usuarios, {
    through: models.MembrosEquipe,
    foreignKey: 'equipe_id',
    otherKey: 'usuario_id',
    as: 'membros',
  });
}

// --- Associações de Torneios ---

// Torneios <-> Jogos (N para 1)
// A tabela 'torneios' tem 'jogo_id'
if (models.Torneios && models.Jogos) {
  models.Torneios.belongsTo(models.Jogos, { foreignKey: 'jogo_id', as: 'jogo' });
  models.Jogos.hasMany(models.Torneios, { foreignKey: 'jogo_id', as: 'torneios' });
}

// Torneios <-> Usuarios (N para 1 - Responsável)
// A tabela 'torneios' tem 'usuario_responsavel_id'
if (models.Torneios && models.Usuarios) {
  models.Torneios.belongsTo(models.Usuarios, { foreignKey: 'usuario_responsavel_id', as: 'responsavel' });
  models.Usuarios.hasMany(models.Torneios, { foreignKey: 'usuario_responsavel_id', as: 'torneios_responsaveis' });
}

// Torneios <-> ConfigsInscricao (1 para 1)
// A tabela 'configs_inscricao' tem 'torneio_id'
if (models.ConfigsInscricao && models.Torneios) {
  models.Torneios.hasOne(models.ConfigsInscricao, { foreignKey: 'torneio_id', as: 'configuracao_inscricao' });
  models.ConfigsInscricao.belongsTo(models.Torneios, { foreignKey: 'torneio_id', as: 'torneio' });
}

// Torneios <-> EtapasPartida (1 para N)
// A tabela 'etapas_partida' tem 'torneio_id'
if (models.Torneios && models.EtapasPartida) {
  models.Torneios.hasMany(models.EtapasPartida, { foreignKey: 'torneio_id', as: 'etapas' });
  models.EtapasPartida.belongsTo(models.Torneios, { foreignKey: 'torneio_id', as: 'torneio' });
}

// Torneios <-> Participantes (1 para N)
// A tabela 'participantes' tem 'torneio_id'
if (models.Participantes && models.Torneios) {
  models.Torneios.hasMany(models.Participantes, { foreignKey: 'torneio_id', as: 'participantes' });
  models.Participantes.belongsTo(models.Torneios, { foreignKey: 'torneio_id', as: 'torneio' });
}

// --- Associações de Participantes ---

// Participantes <-> Usuarios (1 para 1, opcional)
// A tabela 'participantes' tem 'usuario_id'
if (models.Participantes && models.Usuarios) {
  models.Participantes.belongsTo(models.Usuarios, { foreignKey: 'usuario_id', as: 'usuario' });
  models.Usuarios.hasOne(models.Participantes, { foreignKey: 'usuario_id', as: 'participacao_torneio' });
}

// Participantes <-> Equipes (1 para 1, opcional)
// A tabela 'participantes' tem 'equipe_id'
if (models.Participantes && models.Equipes) {
  models.Participantes.belongsTo(models.Equipes, { foreignKey: 'equipe_id', as: 'equipe' });
  models.Equipes.hasOne(models.Participantes, { foreignKey: 'equipe_id', as: 'participacao_torneio' });
}


// --- Associações de Partidas e Chaveamentos ---

// EtapasPartida <-> Partidas (1 para N)
// A tabela 'partidas' tem 'etapa_id'
if (models.Partidas && models.EtapasPartida) {
    models.EtapasPartida.hasMany(models.Partidas, { foreignKey: 'etapa_id', as: 'partidas' });
    models.Partidas.belongsTo(models.EtapasPartida, { foreignKey: 'etapa_id', as: 'etapa' });
}

// Partidas <-> Chaveamentos (1 para N)
// A tabela 'chaveamentos' tem 'partida_id'
if (models.Chaveamentos && models.Partidas) {
  models.Partidas.hasMany(models.Chaveamentos, { foreignKey: 'partida_id', as: 'chaveamentos' });
  models.Chaveamentos.belongsTo(models.Partidas, { foreignKey: 'partida_id', as: 'partida' });
}

// Chaveamentos <-> Participantes (Múltiplas N para 1)
// 'chaveamentos' tem 'participante_a_id', 'participante_b_id', e 'vencedor_id'
if (models.Chaveamentos && models.Participantes) {
  // Um Chaveamento pertence a um Participante (A, B e Vencedor)
  models.Chaveamentos.belongsTo(models.Participantes, { foreignKey: 'participante_a_id', as: 'participante_a' });
  models.Chaveamentos.belongsTo(models.Participantes, { foreignKey: 'participante_b_id', as: 'participante_b' });
  models.Chaveamentos.belongsTo(models.Participantes, { foreignKey: 'vencedor_id', as: 'vencedor' });

  // Um Participante pode estar em muitos Chaveamentos
  models.Participantes.hasMany(models.Chaveamentos, { foreignKey: 'participante_a_id', as: 'jogos_como_participante_a' });
  models.Participantes.hasMany(models.Chaveamentos, { foreignKey: 'participante_b_id', as: 'jogos_como_participante_b' });
  models.Participantes.hasMany(models.Chaveamentos, { foreignKey: 'vencedor_id', as: 'jogos_vencidos' });
}


// --- Associações de Logs e Pontos ---

// Partidas <-> LogsPartida (1 para N)
// A tabela 'logs_partida' tem 'partida_id'
if (models.Partidas && models.LogsPartida) {
  models.Partidas.hasMany(models.LogsPartida, { foreignKey: 'partida_id', as: 'logs' });
  models.LogsPartida.belongsTo(models.Partidas, { foreignKey: 'partida_id', as: 'partida' });
}

// LogsPartida <-> Usuarios (Múltiplas N para 1)
// A tabela 'logs_partida' tem 'usuario_origem_id' e 'usuario_destino_id'
if (models.Usuarios && models.LogsPartida) {
  models.LogsPartida.belongsTo(models.Usuarios, { foreignKey: 'usuario_origem_id', as: 'usuario_origem' });
  models.LogsPartida.belongsTo(models.Usuarios, { foreignKey: 'usuario_destino_id', as: 'usuario_destino' });

  models.Usuarios.hasMany(models.LogsPartida, { foreignKey: 'usuario_origem_id', as: 'logs_enviados' });
  models.Usuarios.hasMany(models.LogsPartida, { foreignKey: 'usuario_destino_id', as: 'logs_recebidos' });
}

// SaldoPontos <-> Usuarios (N para 1)
// A tabela 'saldo_pontos' tem 'usuario_id'
if (models.SaldoPontos && models.Usuarios) {
  models.Usuarios.hasMany(models.SaldoPontos, { foreignKey: 'usuario_id', as: 'saldos_pontos' });
  models.SaldoPontos.belongsTo(models.Usuarios, { foreignKey: 'usuario_id', as: 'usuario' });
}

// SaldoPontos <-> Jogos (N para 1)
// A tabela 'saldo_pontos' tem 'jogo_id'
if (models.SaldoPontos && models.Jogos) {
  models.Jogos.hasMany(models.SaldoPontos, { foreignKey: 'jogo_id', as: 'saldos_pontos_jogo' });
  models.SaldoPontos.belongsTo(models.Jogos, { foreignKey: 'jogo_id', as: 'jogo' });
}


// Exporta os models com as associações configuradas
export default models;