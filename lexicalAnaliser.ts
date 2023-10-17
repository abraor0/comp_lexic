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
  'q23': 'esp',
  'q24': 'tab',
  'q25': 'salt',
  'q26': 'VIR',
  'q27': 'ERRO',
} as {[index: string]: TOKEN_CLASSES};

import { EOF, alphabet, digits, letters, symbolTable } from "./index";
import TOKEN, { TOKEN_CLASSES, TOKEN_TYPES } from "./token";

function transition(currentState: string, char: string): string {
  // tratar EOF dps
  switch (currentState) {
    case 'q0':
      if (char === '{') return 'q1';
      else if (char === '"') return 'q3';
      else if (digits.includes(char)) return 'q5';
      else if (letters.includes(char)) return 'q11';
      else if (char === EOF) return 'q12';
      else if (char === '<') return 'q13';
      else if (char === '>') return 'q17';
      else if (['+', '-', '/', '*'].includes(char)) return 'q19';
      else if (char === '(') return 'q20';
      else if (char === ')') return 'q21';
      else if (char === ';') return 'q22';
      else if (char === ' ') return 'q23';
      else if (char === '\t') return 'q24';
      else if (char === '\n') return 'q25';
      else if (char === ',') return 'q26';
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
      else if (char === 'E' || char === 'e') return 'q8';
      else if (alphabet.includes(char)) return 'q0';
    case 'q6':
      if (digits.includes(char)) return 'q7';
    case 'q7':
      if (digits.includes(char)) return 'q7';
      else if (char === 'E' || char === 'e') return 'q8';
      else if (alphabet.includes(char)) return 'q0';
    case 'q8':
      if (['+','-'].includes(char)) return 'q9';
      else if (digits.includes(char)) return 'q10';
    case 'q9':
      if (digits.includes(char)) return 'q10';
    case 'q10':
      if (digits.includes(char)) return 'q10';
      else if (alphabet.includes(char)) return 'q0';
    case 'q11':
      if (letters.includes(char) || digits.includes(char) || char === '_') return 'q11';
      else if (alphabet.includes(char)) return 'q0';
    case 'q12':
      if (alphabet.includes(char)) return 'q0';
    case 'q13':
      if (char === '>') return 'q14';
      else if (char === '=') return 'q15';
      else if (char === '-') return 'q16';
      else if (alphabet.includes(char)) return 'q0';
    case 'q14':
      if (alphabet.includes(char)) return 'q0';
    case 'q15':
      if (alphabet.includes(char)) return 'q0';
    case 'q16':
      if (alphabet.includes(char)) return 'q0';
    case 'q17':
      if (char === '=') return 'q18';
      else if (alphabet.includes(char)) return 'q0';
    case 'q18':
      if (alphabet.includes(char)) return 'q0';
    case 'q19':
      if (alphabet.includes(char)) return 'q0';
    case 'q20':
      if (alphabet.includes(char)) return 'q0';
    case 'q21':
      if (alphabet.includes(char)) return 'q0';
    case 'q22':
      if (alphabet.includes(char)) return 'q0';
    case 'q23':
      if (alphabet.includes(char)) return 'q0';
    case 'q24':
      if (alphabet.includes(char)) return 'q0';
    case 'q25':
      if (alphabet.includes(char)) return 'q0';
    case 'q26':
      if (alphabet.includes(char)) return 'q0';
    case 'q27':
      if (alphabet.includes(char)) return 'q0';
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
      let type: TOKEN_TYPES | null = null;

      if (classe === 'id') {
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
        else type = 'real';
      }
      
      yield new TOKEN(classe, lexeme, type);
    }
  }
}

export default Scanner;