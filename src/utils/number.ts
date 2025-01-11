export const numberClean = (text: string): string => {
    return text.replaceAll('!m', '').replaceAll('+', '').replaceAll(' ', '');
}