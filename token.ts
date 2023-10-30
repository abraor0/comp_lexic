import { reservedWords } from "./index";

export type TOKEN_CLASSES = 'Num' | 'Lit' | 'id' | 'Comentário' | 'EOF'| 'OPR' | 'RCB' | 'OPM' | 'AB_P' | 'FC_P' | 'PT_V' | 'ERRO' | 'VIR' | 'esp' | 'tab' | 'salt' | typeof reservedWords[number];
export type TOKEN_TYPES = 'inteiro' | 'real' | 'literal' | typeof reservedWords[number];

class TOKEN {
  classe: TOKEN_CLASSES;
  lexema: string |  null;
  tipo: TOKEN_TYPES | null;

  constructor(classe: TOKEN_CLASSES, lexema: string | null, tipo: TOKEN_TYPES | null) {
    this.classe = classe;
    this.lexema = lexema;
    this.tipo = tipo;
  }

  toString() {
    return `(${this.classe}, ${this.lexema}, ${this.tipo})`;
  }
}

export default TOKEN;