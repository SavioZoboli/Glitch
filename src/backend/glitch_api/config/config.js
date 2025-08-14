require('dotenv').config();
module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port":process.env.DB_PORT,
    "dialect": "postgres",
    "seederStorage": "sequelize",
    "seederStorageTableName": "tb_seeders",
    "migrationStorage": "sequelize",
    "migrationStorageTableName": "tb_migrations"
  },
  "test": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port":process.env.DB_PORT,
    "dialect": "postgres",
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port":process.env.DB_PORT,
    "dialect": "postgres",
  }
}
