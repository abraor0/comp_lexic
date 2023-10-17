"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservedWords = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const token_1 = __importDefault(require("./token"));
const lexicalAnaliser_1 = __importDefault(require("./lexicalAnaliser"));
const alphabetSymbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,;:.!?\*+-/(){}[]<>=\'"_';
exports.reservedWords = [
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
];
const symbolTable = exports.reservedWords.reduce((prev, curr) => {
    prev[curr] = new token_1.default(curr, curr, null);
    return prev;
}, {});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = process.argv[2];
        const file = yield promises_1.default.open(`./${fileName}`);
        const fileContent = (yield file.readFile()).toString();
        const scanner = (0, lexicalAnaliser_1.default)(fileContent);
        let i = 0;
        for (let token of scanner) {
            console.log(token);
            ++i;
            if (i == 10)
                break;
        }
    });
}
main();
