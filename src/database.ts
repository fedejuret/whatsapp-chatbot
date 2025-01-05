import { PostgreSQLAdapter } from '@builderbot/database-postgres'

export type IDatabase = typeof PostgreSQLAdapter
export const adapterDB = new PostgreSQLAdapter({
    host: 'localhost',
    user: 'root',
    database: 'whatsapp_bot',
    password: 'password',
    port: 5432,
})
