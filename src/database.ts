import { MemoryDB } from '@builderbot/bot'
import { PostgreSQLAdapter } from '@builderbot/database-postgres'

export type IDatabase = typeof PostgreSQLAdapter
export const adapterDB = new PostgreSQLAdapter({
    host: 'localhost',
    user: 'root',
    database: 'bot',
    password: 'password',
    port: 5432,
})
// export const adapterDB = new MemoryDB();