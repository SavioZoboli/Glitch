const { sequelize } = require('./src/config/database.config');
sequelize.query("SELECT nome, link_transmissao FROM torneios ORDER BY nome DESC LIMIT 5")
  .then(r => { console.log(JSON.stringify(r[0], null, 2)); process.exit(0); })
  .catch(e => { console.log('ERRO:', e.message); process.exit(1); });
