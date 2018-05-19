"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var DatasetNodes = require("./nodes/dataset");
var StringNodes = require("./nodes/string");
var NumberNodes = require("./nodes/number");
exports.NodesMap = new Map([DatasetNodes, StringNodes, NumberNodes]
    .map(function (n) { return Object.values(n); })
    .reduce(function (list, elem, _, all) { return list.concat(elem); }, [])
    .map(function (n) { return [n.name, n]; }));
__export(require("./interfaces"));
__export(require("./utils"));
__export(require("./nodes/dataset"));
__export(require("./nodes/number"));
__export(require("./nodes/string"));
