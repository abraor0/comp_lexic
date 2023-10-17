"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer = [];
const currentState = 'q0';
function transition(currentState, char) {
}
function* Scanner(file) {
    for (const char of file) {
        buffer.push(char);
        yield buffer.join();
    }
}
exports.default = Scanner;
