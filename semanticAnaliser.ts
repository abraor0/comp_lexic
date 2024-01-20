import fs from 'fs/promises';
import { symbolTable } from ".";
import TOKEN from "./token";
import { column, line } from './lexicalAnaliser';

type stacktypes = 'literal' | 'real' | 'inteiro';

export const semantic_stack: (TOKEN | string)[] = [];
let vars: string[] = [];
let tempVars = '';
let tempVarsCounter = 0;
let code = '';
export let semanticErrHappened = false;

const rulesHandlers: {
  lastType: null | number,
  varLine: string[],
  lastLoopCondition: string,
  [index: number]: VoidFunction
} = {
  lastType: null,
  varLine: [],
  lastLoopCondition: '',
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
    vars.push('double ');
  },

  11: () => {
    semantic_stack.splice(-1);
    const typeIndex = semantic_stack.push('literal') - 1;
    rulesHandlers['lastType'] = typeIndex; 
    vars.push('literal ');
  },

  13: () => {
    const [ leia, id, pt_v ] = semantic_stack.splice(-3);
    if(id instanceof TOKEN) {
      if (id.tipo) {
        switch(id.tipo) {
          case 'literal': 
            code += `scanf("%s", ${id.lexema});\n`;
            break;
          case 'inteiro': 
            code += `scanf("%d", &${id.lexema});\n`;
            break;
          case 'real': 
            code += `scanf("%lf", &${id.lexema});\n`;
            break;
        }
        semantic_stack.push('l');
      } else {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Variável não declarada`)
      }
    }
  },

  14: () => {
    const [, arg,] = semantic_stack.splice(-3);
    if(arg instanceof TOKEN) {
      if(arg.classe === 'id') {
        let formatString = '';
        if (arg.tipo === 'literal') formatString = '%s';
        else if (arg.tipo === 'inteiro') formatString = "%d";
        else formatString = "%lf";

        code += `printf("${formatString}", ${arg.lexema});\n`;
      } else if(arg.tipo === 'literal') {
        code += `printf(${arg.lexema});\n`;
      } else {
        code += `printf("${arg.lexema}");\n`;
      }
    }
  },

  15: () => {
    const [ lit ] = semantic_stack.splice(-1);
    if(lit instanceof TOKEN) {
      semantic_stack.push(new TOKEN(lit.classe, lit.lexema, lit.tipo));
    }
  },

  16: () => {
    const [ num ] = semantic_stack.splice(-1);
    if(num instanceof TOKEN) {
      semantic_stack.push(new TOKEN(num.classe, num.lexema, num.tipo));
    }
  },

  17: () => {
    const [ id ] = semantic_stack.splice(-1);
    if (id instanceof TOKEN) {
      if(id.classe === 'id' && id.tipo === null) {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Variável não declarada`)
      } else {
        semantic_stack.push(id);
      }
    }
  },
  19: () => {
    const [id,rcb,ld,] = semantic_stack.splice(-4);
    if(id instanceof TOKEN && rcb instanceof TOKEN && ld instanceof TOKEN) {
      if(id.tipo === null) {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Variável não declarada`)
      } else if(id.tipo !== ld.tipo && !(id.tipo === 'real' && ld.tipo === 'inteiro')) {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Tipos diferentes para atribuição`)
      } else {
        code += `${id.lexema} ${rcb.tipo} ${ld.lexema};\n`;
      }
    }
  },
  20: () => {
    const [oprd1, opm, oprd2] = semantic_stack.splice(-3); 
    if(oprd1 instanceof TOKEN && opm instanceof TOKEN && oprd2 instanceof TOKEN) {
      if (oprd1.tipo !== oprd2.tipo || oprd1.tipo === 'literal' || oprd2.tipo === 'literal') {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Operandos com tipos incompatíveis`);
      } else {
        const type = oprd1.tipo === 'real' || oprd2.tipo === 'real' ? 'double' : 'int';
        const tempVarName = `T${tempVarsCounter++}`;
        tempVars += `${type} ${tempVarName};\n`;
        code += `${tempVarName} = ${oprd1.lexema} ${opm.tipo} ${oprd2.lexema};\n`;

        semantic_stack.push(new TOKEN('id', tempVarName, type === 'double' ? 'real' : 'inteiro'));
      }
    }
  }, 
  21: () => {
    const [oprd] = semantic_stack.splice(-1);
    semantic_stack.push(oprd);
  },
  22: () => {
    const [id] = semantic_stack.splice(-1);
    if (id instanceof TOKEN) {
      if (id.tipo === null) {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Variável não declarada`);
      } else {
        semantic_stack.push(id);
      }
    }
  },
  23: () => {
    const [num] = semantic_stack.splice(-1);
    semantic_stack.push(num);
  },
  25: () => {
    code += '}\n';
  },
  26: () => {
    const [se, abp, exp_r, fcp, entao] = semantic_stack.splice(-5);
    if(exp_r instanceof TOKEN) {
      code += `if(${exp_r.lexema}) {\n`;
    }
  },
  27: () => {
    const [oprd1, opr, oprd2] = semantic_stack.splice(-3); 
    if(oprd1 instanceof TOKEN && opr instanceof TOKEN && oprd2 instanceof TOKEN) {
      if (oprd1.tipo === 'literal' && oprd2.tipo !== 'literal' || oprd1.tipo !== 'literal' && oprd2.tipo === 'literal') {
        throw new Error(`Erro semântico - linha ${line - 1} coluna ${column}: Operandos com tipos incompatíveis`);
      } else {
        const tempVarName = `T${tempVarsCounter++}`;
        tempVars += `bool ${tempVarName};\n`;
        const expr = `${tempVarName} = ${oprd1.lexema} ${opr.tipo} ${oprd2.lexema};\n`;
        code += expr;
        const lastItem = semantic_stack[semantic_stack.length - 2];
        if (lastItem instanceof TOKEN && lastItem.classe === 'repita') {
          rulesHandlers['lastLoopCondition'] = expr;
        }
        semantic_stack.push(new TOKEN('id', tempVarName, null));
      }
    }
  },
  33: () => {
    const [cabr, cpr] = semantic_stack.splice(-2);
  },
  34: () => {
    const [repita, apb_p, exp_r, fc_p] = semantic_stack.splice(-4);
    if(exp_r instanceof TOKEN) {
      code += `while(${exp_r.lexema}) {\n`;
    }
  },
  38: () => {
    const [fimrepita] = semantic_stack.splice(-1);
    const condition = rulesHandlers['lastLoopCondition'];
    code += `${condition}`;
  }
}

export async function generateOutput() {
  await fs.writeFile('PROGRAMA.C', `#include<stdio.h>
#include <stdbool.h>
typedef char literal[256];
int main(void)
{
/*----Variaveis temporarias----*/
${tempVars}/*------------------------------*/
${vars.join('')}${code}

return 0;
}  `, {flag: 'w+'});
}

export default function semantic(prodNumber: keyof typeof rulesHandlers) {
  if (!rulesHandlers[prodNumber]) return;
  try {
    ( rulesHandlers[prodNumber] as VoidFunction )();
  } catch(e) {
    if(e instanceof Error) {
      semanticErrHappened = true;
      console.log(e.message);
    }
  }
}