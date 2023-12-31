import fs from 'fs/promises';
import TOKEN from './token';
import { syntaxAnaliser } from './sintaxAnaliser';

export const EOF = '@';
export const valid_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,;:.!?\\*+-/(){}[]<>=\'"_ \t\n\r';
export const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const digits = '0123456789';
export const stateResetters = '{"' + digits + letters
export const reservedWords = [
  'inicio',
  'varinicio',
  'varfim',
  'escreva',
  'leia',
  'se',
  'entao',
  'fimse',
  'repita',
  'fimrepita',
  'fim',
  'inteiro',
  'literal',
  'real'
] as const ;
export const symbolTable = reservedWords.reduce((prev, curr) => {
  prev[curr] = new TOKEN(curr, curr, null);
  return prev;
}, {} as {[index: string]: TOKEN});

async function main() : Promise<void> {
  const fileName = process.argv[2];
  const file = await fs.open(`./${fileName}`);
  const fileContent = (await file.readFile()).toString() + '@';

  await syntaxAnaliser(fileContent);  
}

main();