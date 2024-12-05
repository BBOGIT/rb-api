// const { DB_CONFIG } = process.env;

const DB_CONFIG = JSON.parse(process.env.DB_CONFIG);

module.exports = {
  host: DB_CONFIG.dbHost,
  type: DB_CONFIG.dbDialect,
  port: parseInt(DB_CONFIG.dbPort, 10),
  username: DB_CONFIG.dbUser,
  password: DB_CONFIG.dbPassword,
  database: DB_CONFIG.dbName,

  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
  migrations: ['dist/db/migrations/*.js'],
  // migrations: ['db/migrations/**/*.ts'],
  seeds: ['dist/db/seeds/**/*.seed.js'],
  // seeds: ['db/seeds/**/*.seed.ts'],
  synchronize: true,
  cli: {
    migrationsDir: 'db/migrations',
  },
};
