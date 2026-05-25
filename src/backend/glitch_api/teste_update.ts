const { sequelize } = require('./src/config/database.config');
sequelize.query("UPDATE torneios SET link_transmissao = 'https://kick.com/teste' WHERE nome = 'teste'")
  .then(r => { console.log('OK'); process.exit(0); })
  .catch(e => { console.log('ERRO:', e.message); process.exit(1); });
