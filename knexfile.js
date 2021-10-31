// Update with your config settings.
require('dotenv').config()

module.exports = {

  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.PORT || process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  pool: {
    min: 4,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }

};
