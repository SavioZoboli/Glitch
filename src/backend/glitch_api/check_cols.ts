const { sequelize } = require('./src/config/database.config');
sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'torneios'")
  .then(r => { console.log(JSON.stringify(r[0], null, 2)); process.exit(0); })
  .catch(e => { console.log('ERRO:', e.message); process.exit(1); });
