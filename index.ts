import fs from 'fs/promises';
import TOKEN from './token';
import Scanner from './lexicalAnaliser';

export const EOF = 'eof';
export const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,;:.!?\*+-/(){}[]<>=\'"_';
export const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const digits = '0123456789';
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
  const fileContent = (await file.readFile()).toString();

  const scanner = Scanner(fileContent);

  let i = 0;
  for(let token of scanner) {
    console.log(token);
    ++i;
    if (i == 10) break;
  }
}

main();