require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2', 
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'your_username',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_DATABASE || 'your_database',
    },
    migrations: {
      directory: './migrations', 
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
