// src/models/index.ts

import { sequelize } from '../config/database.config'; // Importa a instância do Sequelize


// Exemplo de como importar de cada subpasta
import * as PessoasModels from './pessoas/index.pessoas';

// Consolida todos os modelos importados em um único objeto
const models = {
  ...PessoasModels,
};

// Define um tipo para o objeto `models` para facilitar a tipagem nas associações
export type AppModels = typeof models;

// * Define o relacionamento entre as três tabelas
if (models.Usuarios && models.Pessoas && models.TiposUsuario) {
  models.Usuarios.belongsTo(models.Pessoas, { foreignKey: 'pessoa_id', as: 'pessoa' });
  models.Pessoas.hasOne(models.Usuarios, { foreignKey: 'pessoa_id', as: 'usuario' }); // Se cada pessoa tem 0 ou 1 usuário
  models.Usuarios.belongsTo(models.TiposUsuario, { foreignKey: 'tipo_usuario_id', as: 'tipoUsuario' });
  models.TiposUsuario.hasMany(models.Usuarios, { foreignKey: 'tipo_usuario_id', as: 'usuarios' });
}

if(models.Usuarios && models.Equipes && models.MembrosEquipe){
  // Define o relacionamento muitos para muitos entre usuários e equipes através de membrosEquipe
  
  // * ex.: Usuarios são de muitas equipes por meio de membrosEquipe com a chave usuario_id e equipe_id com o nome de equipes

  models.Usuarios.belongsToMany(models.Equipes, { through: models.MembrosEquipe, foreignKey: 'usuario_id', otherKey: 'equipe_id', as: 'equipes' });
  models.Equipes.belongsToMany(models.Usuarios, { through: models.MembrosEquipe, foreignKey: 'equipe_id', otherKey: 'usuario_id', as: 'membros' });
}
// * Exporta os models. É esse models que precisa ser utilizado nas services, pois ele possui as ligações entre as tabelas.
export default  models;