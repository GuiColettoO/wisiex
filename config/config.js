module.exports = {
  development: {
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASS || 'postgres',
    database: process.env.POSTGRES_DB   || 'wisiex',
    host:     process.env.POSTGRES_HOST || '127.0.0.1',
    port:     process.env.POSTGRES_PORT || 5432,
    dialect:  'postgres'
  },
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'wisiex_test',
    host:     '127.0.0.1',
    port:     5432,
    dialect:  'postgres'
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
    host:     process.env.POSTGRES_HOST,
    port:     process.env.POSTGRES_PORT,
    dialect:  'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    }
  }
};