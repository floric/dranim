"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sockets_1 = require("../sockets");
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
