"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sockets_1 = require("../sockets");
exports.StringInputNodeDef = {
    name: 'String Input',
    inputs: [],
    outputs: [sockets_1.StringSocket('String')],
    keywords: [],
    path: ['String']
};
exports.StringOutputNodeDef = {
    name: 'String Output',
    inputs: [sockets_1.StringSocket('String')],
    outputs: [],
    keywords: [],
    path: ['String']
};
