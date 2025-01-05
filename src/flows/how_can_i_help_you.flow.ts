import { addKeyword, EVENTS } from '@builderbot/bot'
import softwareDevelopmentFlow from './software_development_services/main_flow';


const availablesOptions = {
    1: "Consultar sobre servicios de desarrollo de sistemas a medida 💻",
    2: "Consultar sobre servicio tecnico de computadoras, impresoras y pantallas 🪛",
    3: "Ver portfolio online 🌎",
    4: "Dejar un mensaje directo (será respondido por Fede cuando tenga tiempo 😁)"
}

const isValidAnswer = (answer: number): boolean => Object.prototype.hasOwnProperty.call(availablesOptions, answer);
const buildAnswer = (): string => Object.entries(availablesOptions).map(([key, value]) => `${key}. ${value}`).join('\n');

const howCanHelpYouFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(`*Responde con el numero correspondiente*\n\n` + buildAnswer(),
        { capture: true },
        async (ctx, { fallBack, gotoFlow, flowDynamic, blacklist}) => {
            const answer = parseInt(ctx.body);

            if (isNaN(answer) || !isValidAnswer(answer)) {
                return fallBack('Por favor, selecciona una opción disponible.')
            }
            
            if (answer === 1) {
                return gotoFlow(softwareDevelopmentFlow);
            }

            if (answer === 2) {
                await flowDynamic('El servicio de reparacion de equipos informaticos dejó de realizarse y ya no será ofrecido más. Disculpe las molestias.')
                return fallBack('¿Hay algo mas que pueda hacer por ti?');
            }

            if (answer === 3) {
                await flowDynamic('En el sitio web encontrarás información sobre Fede. Algunos proyectos en los que trabajó y también sus certificaciones.\nLink: https://federicojuretich.com')
                return fallBack('¿Hay algo mas que pueda hacer por ti?');
            }

            if (answer === 4) {
                await flowDynamic('Excelente, me desactivaré para ti entonces por un rato. A continuación escribe el mensaje:')
                blacklist.add(ctx.from);
                return;
            }

        },
    );

export default howCanHelpYouFlow;