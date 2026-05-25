require('dotenv').config();
const { sequelize } = require('./src/config/database.config');
const { Torneios } = require('./src/models/torneios/torneios.model');
const { v4: uuidv4 } = require('uuid');

async function test() {
  await sequelize.authenticate();
  const t = await Torneios.create({
    id: uuidv4(),
    jogo_id: 'd0e3f11d-3f67-46d7-b9d1-15ea6afb5c0f',
    usuario_responsavel_id: '58584768-1502-4bef-8634-3d037b357518',
    nome: 'link test',
    dt_inicio: new Date(),
    link_transmissao: 'https://kick.com/rammus53'
  });
  console.log('Criado:', JSON.stringify(t.dataValues, null, 2));
  process.exit(0);
}

test().catch(e => { console.log('ERRO:', e.message); process.exit(1); });
