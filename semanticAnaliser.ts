import fs from 'fs/promises';
import { symbolTable } from ".";
import TOKEN from "./token";

type stacktypes = 'literal' | 'real' | 'inteiro';

export const semantic_stack: (TOKEN | stacktypes )[] = [];
let vars: string[] = [];
let code = '';

const rulesHandlers: {
  lastType: null | number,
  varLine: string[],
  [index: number]: VoidFunction
} = {
  lastType: null,
  varLine: [],
  5: () => {
    semantic_stack.length -= 2;
    vars.push('\n\n\n');
  },
  6: () => {
    semantic_stack.splice(-3);
    vars.push(`${rulesHandlers['varLine'].join('')};\n`);
    rulesHandlers['lastType'] = null;
    rulesHandlers['varLine'].length = 0;
  },
  7: () => {
    const [ id,, ] = semantic_stack.splice(-3);
    const typeDeclared = semantic_stack[rulesHandlers['lastType']!] as stacktypes;
    symbolTable[(id as TOKEN).lexema!]['tipo'] = typeDeclared;
    semantic_stack.push(typeDeclared);
    rulesHandlers['varLine'].unshift(`${symbolTable[(id as TOKEN).lexema!]['lexema']},`);
  },
  8: () => {
    const id = semantic_stack.splice(-1)[0];
    if(typeof id !== 'string' && id.lexema !== null) {
      const type = semantic_stack[rulesHandlers['lastType']!] as stacktypes;
      id['tipo'] = type
      rulesHandlers['varLine'].unshift(`${id.lexema}`);
      semantic_stack.push(type);
    }
  },
  9: () => {
    semantic_stack.splice(-1);
    const typeIndex = semantic_stack.push('inteiro') - 1;
    rulesHandlers['lastType'] = typeIndex; 
    vars.push('int ');
  },
  10: () => {
    semantic_stack.splice(-1);
    const typeIndex = semantic_stack.push('real') - 1;
    rulesHandlers['lastType'] = typeIndex; 
    vars.push('float ');
  },

  11: () => {
    semantic_stack.splice(-1);
    const typeIndex = semantic_stack.push('literal') - 1;
    rulesHandlers['lastType'] = typeIndex; 
    vars.push('literal ');
  }
}

export async function generateOutput() {
  console.log(vars);
  await fs.writeFile('PROGRAMA.C', `#include<stdio.h>
typedef char literal[256];
void main(void)
{
${vars.join('')}
}  `, {flag: 'w+'});
}

export default function semantic(prodNumber: keyof typeof rulesHandlers) {
  if (!rulesHandlers[prodNumber]) return;
 ( rulesHandlers[prodNumber] as VoidFunction)();
}