import { addKeyword, EVENTS } from '@builderbot/bot'
import howCanHelpYouFlow from './how_can_i_help_you.flow';

const whiteList = [
    '5492923449700'
];

const welcomeFlow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, data) => {
        const user = ctx.from;

        // if (!whiteList.includes(user)) {
        //     console.log(user, 'in blacklist')
        //     data.blacklist.add(user);
        //     return;
        // }

        await data.flowDynamic(
            `Hola, soy Gemi, un asistente virtual desarrollado por Federico.\n¿En qué puedo ayudarte?`
        );

        return data.gotoFlow(howCanHelpYouFlow);
    });

export default welcomeFlow;