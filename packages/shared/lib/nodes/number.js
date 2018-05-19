"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sockets_1 = require("../sockets");
exports.FormatNumberNodeDef = {
    name: 'Format Number',
    inputs: [sockets_1.NumberSocket('Number')],
    outputs: [sockets_1.StringSocket('Formatted')],
    path: ['Numbers', 'Converters'],
    keywords: []
};
exports.NumberInputNodeDef = {
    name: 'Number Input',
    inputs: [],
    outputs: [sockets_1.NumberSocket('Number')],
    path: ['Numbers'],
    keywords: []
};
exports.MultiplicationNodeDef = {
    name: 'Multiplication',
    inputs: [sockets_1.NumberSocket('A'), sockets_1.NumberSocket('B')],
    outputs: [sockets_1.NumberSocket('Product')],
    path: ['Numbers', 'Operators'],
    keywords: ['times', 'multiplication']
};
exports.NumberOutputNodeDef = {
    name: 'Number Output',
    inputs: [sockets_1.NumberSocket('Number')],
    outputs: [],
    keywords: [],
    path: ['Numbers']
};
exports.SumNodeDef = {
    name: 'Sum',
    inputs: [sockets_1.NumberSocket('A'), sockets_1.NumberSocket('B')],
    outputs: [sockets_1.NumberSocket('Sum')],
    path: ['Numbers', 'Operators'],
    keywords: ['sum', 'add']
};
