import Scanner, { column, line } from './lexicalAnaliser';
import csv from 'csvtojson';
import TOKEN from './token';

const productions = [
  "P' -> P",
  "P -> inicio V A",
  "V -> varinicio LV",
  "LV -> D LV",
  "LV -> varfim pt_v",
  "D -> TIPO L pt_v",
  "L -> id vir L",
  "L -> id",
  "TIPO -> inteiro",
  "TIPO -> real",
  "TIPO -> literal",
  "A -> ES A",
  "ES -> leia id pt_v",
  "ES -> escreva ARG pt_v",
  "ARG -> lit",
  "ARG -> num",
  "ARG -> id",
  "A -> CMD A",
  "CMD -> id atr LD pt_v",
  "LD -> OPRD opm OPRD",
  "LD -> OPRD",
  "OPRD -> id",
  "OPRD -> num",
  "A -> COND A",
  "COND -> CAB CP",
  "CAB -> se ab_p EXP_R fc_p então",
  "EXP_R -> OPRD opr OPRD",
  "CP -> ES CP",
  "CP -> CMD CP",
  "CP -> COND CP",
  "CP -> fimse",
  "A -> R A",
  "R -> CABR CPR",
  "CABR -> repita ab_p EXP_R fc_p",
  "CPR -> ES CPR",
  "CPR -> CMD CPR",
  "CPR -> COND CPR",
  "CPR -> fimrepita",
  "A -> fim"
];

type syntaxTableI = {
  [key: string]: string;
};

function getProdSize(production: string) {
  const beginning = production.indexOf('->');
  const tokens = production.slice(beginning + 2).trim().split(' ');
  
  return tokens.length;
}

function recoverFromError(currentState: number, nextToken: string, syntaxTable: syntaxTableI[], getNextToken: () => void | TOKEN, stack: number[]) {
  const expectedTokens: string[] = [];
  for (let token in syntaxTable[currentState]) {
    if(syntaxTable[currentState][token] != '') {
      const formatedToken = `\'${token}\'`; 
      expectedTokens.push(formatedToken);
    }
  }
  console.log(`Erro de sintaxe - linha ${line} coluna ${column}: esperava-se os tokens ${expectedTokens.join(', ')}, mas o token encontrado foi '${nextToken}'`);
  console.log(stack);
  do {
    const stackCopy = [...stack];
    while(stackCopy.length > 0) {
      const s = stackCopy[stackCopy.length - 1];
      //console.log(`Estado ${s} e token  ${nextToken} , valor na tabela -> ${syntaxTable[s][nextToken]}`);
      if(syntaxTable[s][nextToken] !== '') {
        //console.log(`Quebrou com a stack ${stackCopy}`);
        return stackCopy;
      }
      stackCopy.pop();
    }
    const a = getNextToken();
    if (a == void 0) break;
    else nextToken = a.classe;
  } while (1);

  return [0];
}

export async function syntaxAnaliser(fileContent: string) {
  const syntaxTable: syntaxTableI[]  = await csv().fromFile('./tsin.csv');
  syntaxTable.forEach(elem => delete elem.field1);
  let stack = [0];

  const scanner = Scanner(fileContent);

  let a = scanner.next().value;
  while(1) {
    if(!(a instanceof TOKEN)) {
      return;
    }
    let s = stack[stack.length - 1];
    const action = syntaxTable[s][a.classe];
    console.log(`Proxima transição: estado ${s} e token ${a} -> ${action}`);
    if (action === 'Acc') {
      console.log("Aceito");
      return;
    } else if (action.startsWith('S')) {
      const t = parseInt(action.slice(1));
      stack.push(t);
      a = scanner.next().value;

      console.log(`Shift: ${action}`);
    } else  if(action.startsWith('R')) {
      const t = parseInt(action.slice(1));
      const production = productions[t - 1];
      const reductionVariable = production.split(' ')[0];
      const prodSize = getProdSize(production);
      stack.length -= prodSize;
      s = stack[stack.length - 1];
      stack.push(parseInt(syntaxTable[s][reductionVariable]));
      console.log(`Produção reduzida: ${production}`);
    } else if (action !== '') {
      const t = parseInt(action);
      console.log(`Ação: ${action}`);
    } else { 
      stack = recoverFromError(s, a.classe, syntaxTable, () => {
        a = scanner.next().value;

        return a;
      }, stack);
    }
  }
}