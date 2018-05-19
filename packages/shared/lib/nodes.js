"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sockets_1 = require("./sockets");
exports.DatasetInputNodeDef = {
    name: 'Dataset Input',
    inputs: [],
    outputs: [sockets_1.DataSocket('Dataset')],
    path: ['Dataset'],
    keywords: []
};
exports.JoinDatasetsNodeDef = {
    name: 'Dataset Output',
    inputs: [sockets_1.DataSocket('A'), sockets_1.DataSocket('B')],
    outputs: [sockets_1.DataSocket('Combined')],
    path: ['Dataset'],
    keywords: []
};
exports.SelectValuesNodeDef = {
    name: 'Select Values',
    inputs: [sockets_1.DataSocket('A'), sockets_1.DataSocket('B')],
    outputs: [sockets_1.DataSocket('Combined')],
    path: ['Dataset'],
    keywords: []
};
exports.DatasetOutputNodeDef = {
    name: 'Dataset Output',
    inputs: [sockets_1.DataSocket('Dataset')],
    outputs: [],
    path: ['Dataset'],
    keywords: []
};
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
