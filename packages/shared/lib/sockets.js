"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
exports.DataSocket = function (name) { return ({
    dataType: interfaces_1.DataType.DATASET,
    name: name
}); };
exports.NumberSocket = function (name) { return ({
    dataType: interfaces_1.DataType.NUMBER,
    name: name
}); };
exports.StringSocket = function (name) { return ({
    dataType: interfaces_1.DataType.STRING,
    name: name
}); };
