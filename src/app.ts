import "dotenv/config"
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import welcomeFlow from '~/flows/welcome.flow'
import howCanHelpYouFlow from '~/flows/how_can_i_help_you.flow'
import softwareDevelopmentFlow from "./flows/software_development_services/main_flow"
import { adapterDB } from "./database"

const PORT = process.env.PORT ?? 3008

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, howCanHelpYouFlow, softwareDevelopmentFlow])
    
    const adapterProvider = createProvider(BaileysProvider)

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
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

    httpServer(+PORT)
}

main()
