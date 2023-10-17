"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TOKEN {
    constructor(classe, lexema, tipo) {
        this.classe = classe;
        this.lexema = lexema;
        this.tipo = tipo;
    }
    toString() {
        return `(${this.classe}, ${this.lexema}, ${this.tipo})`;
    }
}
exports.default = TOKEN;
