const buffer: string[] = [];
let currentState = 'q0';
export let i = 0, line = 1, column = 1;
const stateClasses = {
  'q2': 'Comentário',
  'q4': 'Lit',
  'q5': 'Num',
  'q7': 'Num',
  'q10': 'Num',
  'q11': 'id',
  'q12': 'OPR',
  'q13': 'OPR',
  'q14': 'OPR',
  'q15': 'RCB',
  'q16': 'OPR',
  'q17': 'OPR',
  'q18': 'OPM',
  'q19': 'AB_P',
  'q20': 'FC_P',
  'q21': 'PT_V',
  'q22': 'esp',
  'q23': 'tab',
  'q24': 'salt',
  'q25': 'VIR',
  'q26': 'EOF',
  'q27': 'OPR'
} as {[index: string]: TOKEN_CLASSES};

const tokenTypesMap = {
  'OPM': (lexem: string) => lexem,
  'OPR': (lexem: string) => {
    if (lexem === '=') return '==';
    else return lexem;
  },
  'RCB': () => '='
} as any;

export let lexicalErrHappened = false;

import { EOF, valid_chars, digits, letters, symbolTable } from "./index";
import TOKEN, { TOKEN_CLASSES, TOKEN_TYPES } from "./token";

function transition(currentState: string, char: string): string {
  switch (currentState) {
    case 'q0':
      if (char === '{') return 'q1';
      else if (char === '"') return 'q3';
      else if (digits.includes(char)) return 'q5';
      else if (letters.includes(char)) return 'q11';
      else if (char === '<') return 'q12';
      else if (char === '>') return 'q16';
      else if (['+', '-', '/', '*'].includes(char)) return 'q18';
      else if (char === '(') return 'q19';
      else if (char === ')') return 'q20';
      else if (char === ';') return 'q21';
      else if (char === ' ') return 'q22';
      else if (char === '\t') return 'q23';
      else if (char === '\n') return 'q24';
      else if (char === '\r') return 'q24';
      else if (char === ',') return 'q25';
      else if (char === EOF) return 'q26';
      else if (char === '=') return 'q27'
      else if (valid_chars.includes(char)) throw new Error(`Uso inválido do caractere "${char}" na linguagem`);
      break;
    case 'q1':
      if (valid_chars.includes(char) && char !== '}') return 'q1';
      else if (char === '}') return 'q2';
      else if (char === EOF) throw new Error('Token comentário não possui caractere delimitador');
    case 'q2':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q3':
      if (valid_chars.includes(char) && char !== '"') return 'q3';
      else if (char === '"') return 'q4';
      else if (char === EOF) throw new Error('Token literal não possui caractere delimitador');
    case 'q4':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q5':
      if (digits.includes(char)) return 'q5';
      else if (char === '.') return 'q6';
      else if (char === 'E' || char === 'e') return 'q8';
      else if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q6':
      if (digits.includes(char)) return 'q7';
      else if (valid_chars.includes(char) || char === EOF) throw new Error(`Caractere dígito esperado em constante numérica`);
    case 'q7':
      if (digits.includes(char)) return 'q7';
      else if (char === 'E' || char === 'e') return 'q8';
      else if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q8':
      if (['+','-'].includes(char)) return 'q9';
      else if (digits.includes(char)) return 'q10';
      else if (valid_chars.includes(char) || char === EOF) throw new Error(`Caractere dígito esperado em constante numérica`);
    case 'q9':
      if (digits.includes(char)) return 'q10';
      else if (valid_chars.includes(char) || char === EOF) throw new Error(`Caractere dígito esperado em constante numérica`);
    case 'q10':
      if (digits.includes(char)) return 'q10';
      else if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q11':
      if (letters.includes(char) || digits.includes(char) || char === '_') return 'q11';
      else if (valid_chars.includes(char) || char === EOF) return 'q0';
      else throw new Error(`Caractere "${char}" inválido utilizado como identificador`)
    case 'q12':
      if (char === '>') return 'q13';
      else if (char === '=') return 'q14';
      else if (char === '-') return 'q15';
      else if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q13':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q14':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q15':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q16':
      if (char === '=') return 'q17';
      else if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q17':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q18':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q19':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q20':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q21':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q22':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q23':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q24':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q25':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
    case 'q26':
      return 'q0';
    case 'q27':
      if (valid_chars.includes(char) || char === EOF) return 'q0';
  }

  throw new Error(`Caractere "${char}" inválido na linguagem`);
}

function* Scanner(file: string) {
  for ( ; i < file.length + 1; ++i) {
    let char: string;
    if (i !== file.length) char = file[i];
    else char = valid_chars[0];

    let stateWasReseted = false;
    buffer.push(char);
    try {
      const newState = transition(currentState, char);
      if (newState === 'q0') {
        --i;
        stateWasReseted = true;
        buffer.pop();
        const lexeme = buffer.join('');
        buffer.splice(0, buffer.length);
        let classe = stateClasses[currentState];
        currentState = newState;
  
        switch(classe) {
          case 'Comentário':
            break;
          case 'id':
            //console.log(lexeme);
            if (symbolTable[lexeme] !== undefined) yield symbolTable[lexeme];
            else {
              let token = new TOKEN(classe,lexeme, null);
              symbolTable[lexeme] = token;
              //console.log(token);
              yield token;
            }
            break;
          case 'Lit':
            yield new TOKEN(classe, lexeme, 'literal');
            break;
          case 'Num':
            const isOnlyAnIntWithAPoint = [...lexeme.slice(lexeme.lastIndexOf('.') + 1)].every((e) => e === '0');
            if(Number.isInteger(parseFloat(lexeme)) && !isOnlyAnIntWithAPoint) yield new TOKEN(classe, lexeme, 'inteiro');
            else {
              yield new TOKEN(classe, lexeme, 'real');
            }
            break;
          case 'salt':
            break;
          case 'esp':
            break;
          default:
            if (tokenTypesMap[classe]) {
              yield new TOKEN(classe, lexeme, tokenTypesMap[classe](lexeme));
            } else yield new TOKEN(classe, lexeme, null);
            break;
        }
      }
      currentState = newState;
    } catch (e) {
      buffer.pop();
      if(currentState ===  'q9') buffer.pop();
      if (currentState === 'q6' || currentState === 'q8' || currentState === 'q9') {
        --i;
        buffer.pop();
        currentState = 'q5';
      }
      if (e instanceof Error) {
        lexicalErrHappened = true;
        yield new TOKEN('ERRO', null, null);
        console.log(`Erro Léxico - ${(e as Error).message} , linha ${line}, coluna ${column}`);
      } else {
        throw e;
      }
    }

    if (char === '\n' && !stateWasReseted) {
      line++;
      column = 1;
    } else if (!stateWasReseted) {
      column++;
    }

    stateWasReseted = false;
  }
}

export default Scanner;