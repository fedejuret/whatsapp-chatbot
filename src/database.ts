import { PostgreSQLAdapter } from '@builderbot/database-postgres'

export type IDatabase = typeof PostgreSQLAdapter
export const adapterDB = new PostgreSQLAdapter({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT),
})
