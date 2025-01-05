import { toAsk } from '@builderbot-plugins/openai-assistants'
import { addKeyword, EVENTS } from '@builderbot/bot'
import { typing } from '~/utils/presence'
import welcomeFlow from '../welcome.flow';

const ASSISTANT_ID = process.env.ASSISTANT_ID ?? ''
const userQueues = new Map();
const userLocks = new Map();
const firstMessage = new Map();

/**
 * Function to process the user's message by sending it to the OpenAI API
 * and sending the response back to the user.
 */
const processUserMessage = async (ctx, { flowDynamic, state, provider }) => {
    await typing(ctx, provider);

    const response = await toAsk(ASSISTANT_ID, ctx.body, state);

    const chunks = response.split(/\n\n+/);
    for (const chunk of chunks) {
        const cleanedChunk = chunk.trim().replace(/【.*?】[ ] /g, "");
        await flowDynamic([{ body: cleanedChunk }]);
    }

};

/**
 * Function to handle the queue for each user.
 */
const handleQueue = async (userId) => {
    const queue = userQueues.get(userId);

    if (userLocks.get(userId)) {
        return;
    }

    while (queue.length > 0) {
        userLocks.set(userId, true);
        const { ctx, flowDynamic, state, provider } = queue.shift();
        try {
            await processUserMessage(ctx, { flowDynamic, state, provider });
        } catch (error) {
            console.error(`Error processing message for user ${userId}:`, error);
        } finally {
            userLocks.set(userId, false);
        }
    }

    userLocks.delete(userId);
    userQueues.delete(userId);
};

const executeAction = async (ctx, { flowDynamic, state, provider, gotoFlow,  }, step: number) => {
    const userId = ctx.from;

    if (!userQueues.has(userId)) {
        userQueues.set(userId, []);
    }

    if (!firstMessage.has(userId)) {
        firstMessage.set(userId, true);
    } else {
        firstMessage.set(userId, false);
    }

    const queue = userQueues.get(userId);
    queue.push({ ctx, flowDynamic, state, provider });

    if (!userLocks.get(userId) && queue.length === 1) {
        await handleQueue(userId);
    }
    
    return gotoFlow(softwareDevelopmentFlow, step);

}

const softwareDevelopmentFlow = addKeyword(EVENTS.ACTION)
    .addAnswer('Excelete, por favor escribe tu consulta lo mas completa posible a continuación:', { capture: true } )
    .addAction(async (ctx, data) => {
        return executeAction(ctx, data, 3)
    })
    .addAnswer('¿Hay algo mas con lo que te pueda ayudar?', { capture: true } )
    .addAction(async (ctx, data) => {

        if (ctx.body.includes('/menu')) {
            return data.gotoFlow(welcomeFlow);
        }

        return executeAction(ctx, data, 3)
    });

export default softwareDevelopmentFlow;