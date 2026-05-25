require('dotenv').config();
const { sequelize } = require('./src/config/database.config');
const { Torneios } = require('./src/models/torneios/torneios.model');

async function test() {
  await sequelize.authenticate();
  const result = await Torneios.update(
    { link_transmissao: 'https://kick.com/rammus53' },
    { where: { nome: 'stream test' } }
  );
  console.log('Atualizado:', result);
  
  const torneios = await Torneios.findAll({ where: { nome: 'stream test' }, attributes: ['nome', 'link_transmissao'] });
  console.log('Resultado:', JSON.stringify(torneios.map((t) => t.dataValues), null, 2));
  process.exit(0);
}

test().catch(e => { console.log('ERRO:', e.message); process.exit(1); });
