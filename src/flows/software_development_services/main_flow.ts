import { toAsk } from '@builderbot-plugins/openai-assistants'
import { addKeyword, EVENTS } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys';
import { typing } from '~/utils/presence'
import welcomeFlow from '../welcome.flow';

const ASSISTANT_ID = process.env.ASSISTANT_ID ?? ''
const userQueues = new Map();
const userLocks = new Map(); // New lock mechanism
const firstMessage = new Map();

/**
 * Function to process the user's message by sending it to the OpenAI API
 * and sending the response back to the user.
 */
const processUserMessage = async (ctx, { flowDynamic, state, provider }) => {
    await typing(ctx, provider);

    const response = await toAsk(ASSISTANT_ID, ctx.body, state);

    // Split the response into chunks and send them sequentially
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
        return; // If locked, skip processing
    }

    while (queue.length > 0) {
        userLocks.set(userId, true); // Lock the queue
        const { ctx, flowDynamic, state, provider } = queue.shift();
        try {
            await processUserMessage(ctx, { flowDynamic, state, provider });
        } catch (error) {
            console.error(`Error processing message for user ${userId}:`, error);
        } finally {
            userLocks.set(userId, false); // Release the lock
        }
    }

    userLocks.delete(userId); // Remove the lock once all messages are processed
    userQueues.delete(userId); // Remove the queue once all messages are processed
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

    // If this is the only message   in the queue, process it immediately
    if (!userLocks.get(userId) && queue.length === 1) {
        await handleQueue(userId);
    }
    
    return gotoFlow(softwareDevelopmentFlow, step);

}

const softwareDevelopmentFlow = addKeyword(EVENTS.ACTION)
    .addAnswer('Excelete, por favor escribe tu consulta lo mas completa posible a continuacion:', { capture: true } )
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