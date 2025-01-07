import "dotenv/config"
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import welcomeFlow from '~/flows/welcome.flow'
import howCanHelpYouFlow from '~/flows/how_can_i_help_you.flow'
import softwareDevelopmentFlow from "./flows/software_development_services/main_flow"
import { adapterDB } from "./database"
import { PostgreSQLAdapter } from "@builderbot/database-postgres"
import { numberClean } from "./utils/number"

const PORT = process.env.PORT ?? 3008

const blackListFlow = addKeyword<BaileysProvider, PostgreSQLAdapter>('!m')
    .addAction(async (ctx, { blacklist, flowDynamic }) => {
        if (ctx.from === process.env.BOT_BUMBER) {
            const toMute = numberClean(ctx.body)
            const check = blacklist.checkIf(toMute)
            if (!check) {
                blacklist.add(toMute)
                await flowDynamic(`❌ ${toMute} muted`)
                return
            }
            blacklist.remove(toMute)
            await flowDynamic(`🆗 ${toMute} unmuted`)
            return
        }
})

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, howCanHelpYouFlow, softwareDevelopmentFlow, blackListFlow])
    
    const adapterProvider = createProvider(BaileysProvider, {
        groupsIgnore: true,
        writeMyself: 'both'
    })

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null, buttons: [{
                body: "test"
            }] })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    adapterProvider.server.get(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const list = bot.blacklist.getList();
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', list }))
        })
    )

    httpServer(+PORT)
}

main()
