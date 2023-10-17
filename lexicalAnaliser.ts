const buffer: string[] = [];
let currentState = 'q0';
const stateClasses = {
  'q2': 'Comentário',
  'q4': 'Lit',
  'q5': 'Num',
  'q7': 'Num',
  'q10': 'Num',
  'q11': 'id',
  'q12': 'EOF',
  'q13': 'OPR',
  'q14': 'OPR',
  'q15': 'OPR',
  'q16': 'RCB',
  'q17': 'OPR',
  'q18': 'OPR',
  'q19': 'OPM',
  'q20': 'AB_P',
  'q21': 'FC_P',
  'q22': 'PT_V',
  'q23': 'Ignorar',
  'q24': 'ERRO',
  'q25': 'Vir'
} as {[index: string]: TOKEN_CLASSES};

import { alphabet, digits, letters, symbolTable } from "./index";
import TOKEN, { TOKEN_CLASSES } from "./token";

function transition(currentState: string, char: string): string {
  // tratar EOF dps
  switch (currentState) {
    case 'q0':
      if (char === '{') return 'q1';
      else if (char === '"') return 'q3';
      else if (digits.includes(char)) return 'q5';
      else if (letters.includes(char)) return 'q11';
      else if (char === '<') return 'q13';
      else if (char === '>') return 'q17';
      else if (['+', '-', '/', '*'].includes(char)) return 'q19';
      else if (char === '(') return 'q20';
      else if (char === ')') return 'q21';
      else if (char === ';') return 'q22';
      else if ([ , '\n', '\t'].includes(char)) return 'q23';
      else if (char === ',') return 'q25';
    case 'q1':
      if (alphabet.includes(char) && char !== '}') return 'q1';
      else if (char === '}') return 'q2';
    case 'q2':
      if (alphabet.includes(char)) return 'q0';
    case 'q3':
      if (alphabet.includes(char) && char !== '"') return 'q3';
      else if (char === '"') return 'q4';
    case 'q4':
      if (alphabet.includes(char)) return 'q0';
    case 'q5':
      if (digits.includes(char)) return 'q5';
      else if (char === '.') return 'q6';
      else if (char === 'E' || char === 'e') return 'q7';
    case 'q6':
      if (digits.includes(char)) return 'q7';
    default:
      return 'q24';
  }
}

function* Scanner(file: string) {
  for (let i = 0 ; i < file.length ; ++i) {
    const char = file[i];
    buffer.push(char);
    const newState = transition(currentState, char);
    if (newState === 'q0') {
      --i;
      const lexeme = buffer.join();
      let classe = stateClasses[currentState];
      let type;

      if (classe === 'id') {
        type = null;
        if (symbolTable[lexeme] !== undefined) yield symbolTable[lexeme];
        else {
          let token = new TOKEN(classe,lexeme, type);
          symbolTable[lexeme] = token;
        }
      }

      if (classe === 'Lit') {
        type = 'literal';
      } 
      
      if (classe === 'Num') {
        if(Number.isInteger(parseFloat(lexeme))) type = 'inteiro';
        else type = 'float';
      }
      
      yield new TOKEN(classe, lexeme, type);
    }
  }
}

export default Scanner;