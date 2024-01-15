import Scanner, { column, i, line } from './lexicalAnaliser';
import csv from 'csvtojson';
import TOKEN, { TOKEN_NAMES } from './token';
import  semantic, { generateOutput, semantic_stack } from './semanticAnaliser';
import { symbolTable } from '.';

let prevToken: TOKEN | null = null;

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

const errors = {
  'E1': 'declaração de início do código',
  'E2': 'fim de arquivo',
  'E3': 'declaração de bloco de variável',
  'E4': 'algum statement',
  'E5': 'variável',
  'E6': 'operador de atribuição',
  'E7': 'início de parêntesis',
  'E8': 'fim de declaração',
  'E9': 'separador(vírgula) ou fim de declaração',
  'E10': 'fechamento de parêntesis',
  'E11': 'operador lógico',
  'E12': 'fim de condicional',
} as {[key: string]: string};

type syntaxTableI = {
  [key: string]: string;
};

function getProdSize(production: string) {
  const beginning = production.indexOf('->');
  const tokens = production.slice(beginning + 2).trim().split(' ');
  
  return tokens.length;
}

function recoverFromError(currentState: number, nextToken: string, syntaxTable: syntaxTableI[], getNextToken: (correctionToken?: TOKEN) => void | TOKEN, stack: number[]) {
  const error = syntaxTable[currentState][nextToken]; 
  let errorMessage = '';
  console.log(`erro ${error}`);
  
  if (error !== '') {
    errorMessage = `${errors[error]} esperado`;
  } else {
    const expectedTokens: string[] = [];
    for (let token in syntaxTable[currentState]) {
      if(token === 'P') break;
      if(syntaxTable[currentState][token] !== '' && !syntaxTable[currentState][token].startsWith('E')) {
        let formatedToken;
        if(TOKEN_NAMES[token]) {
          formatedToken = TOKEN_NAMES[token];
        } else {
          formatedToken = `\"${token}\"`;
        } 
        expectedTokens.push(formatedToken);
      }
    }

    errorMessage = `esperava-se um ${expectedTokens.join(', ')}`;
  }

  console.log(`Erro de sintaxe - linha ${line} coluna ${column}: ${errorMessage}, mas o token encontrado foi "${TOKEN_NAMES[nextToken] || nextToken}"`);
  //console.log(stack);
  if(error !== '' && error !== 'E4' && error !== 'E5' && error !== 'E11') {
    let tokenToAdd: TOKEN;
    switch(error) {
      case 'E1': 
        tokenToAdd = new TOKEN('inicio', 'inicio', null);
        break;
      case 'E2': 
        tokenToAdd = new TOKEN('EOF', '@', null);
        break;
      case 'E3':
        tokenToAdd = new TOKEN('varinicio', 'varinicio', null);
        break;
      case 'E6': 
        tokenToAdd = new TOKEN('RCB', '<-', null);
        break;
      case 'E7': 
        tokenToAdd = new TOKEN('AB_P', '(', null);
        break;
      case 'E8': 
        tokenToAdd = new TOKEN('PT_V', ';', null);
        break;
      case 'E9': 
        tokenToAdd = new TOKEN('PT_V', ';', null);
        break;
      case 'E10': 
        tokenToAdd = new TOKEN('FC_P', '(', null);
        break;
      case 'E12': 
        tokenToAdd = new TOKEN('entao', 'entao', null);
        break;
      default:
        tokenToAdd = new TOKEN('EOF', '@', null);
    }
    console.log(`Correção global: inserindo token ${tokenToAdd}`);
    getNextToken(tokenToAdd);
    return stack;
  } else {
    do {
      const stackCopy = [...stack];
      while(stackCopy.length > 0) {
        const s = stackCopy[stackCopy.length - 1];
        console.log(`Estado ${s} e token  ${nextToken} , valor na tabela -> ${syntaxTable[s][nextToken]}`);
        if(syntaxTable[s][nextToken] !== '' && !syntaxTable[s][nextToken].startsWith('E')) {
          //console.log(`Quebrou com a stack ${stackCopy}`);
          return stackCopy;
        }
        stackCopy.pop();
      }
      //console.log('AOOOPA');
      const a = getNextToken();
      if (a == void 0) break;
      else nextToken = a.classe;
    } while (1);
  }

  return [0];
}

export async function syntaxAnaliser(fileContent: string) {
  const syntaxTable: syntaxTableI[]  = await csv().fromFile('./tsin.csv');
  syntaxTable.forEach(elem => delete elem.field1);
  let stack = [0];

  const scanner = Scanner(fileContent);

  let a = scanner.next().value;
  
  while(1) {
    //console.log(a);
    if(!(a instanceof TOKEN)) {
      return;
    }
    let s = stack[stack.length - 1];
    const action = syntaxTable[s][a.classe];
    if (action === 'Acc') {
      console.log("Aceito");
      await generateOutput();
      return;
    } else if (action.startsWith('S')) {
      const t = parseInt(action.slice(1));
      stack.push(t);
      semantic_stack.push(a);
      if(!prevToken) {
        a = scanner.next().value;
      } else {
        a = prevToken;
        prevToken = null;
      }
    } else  if(action.startsWith('R')) {
      const t = parseInt(action.slice(1));
      const production = productions[t - 1];
      const reductionVariable = production.split(' ')[0];
      const prodSize = getProdSize(production);
      stack.length -= prodSize;
      s = stack[stack.length - 1];
      stack.push(parseInt(syntaxTable[s][reductionVariable]));
      console.log(semantic_stack);
      semantic(t);
      console.log(`Produção reduzida: ${production}`);
    } else if (action === '' || action.startsWith('E')) {
      stack = recoverFromError(s, a.classe, syntaxTable, (correctionToken?: TOKEN) => {
        //console.log('ta chamando a fução');
        if (!correctionToken) {
          //console.log('entrando aki');
          a = scanner.next().value;
        } else {
          prevToken = a!;
          a = correctionToken;
        }

        return a;
      }, stack);
    } else { 
      const t = parseInt(action);
    }
  }
}