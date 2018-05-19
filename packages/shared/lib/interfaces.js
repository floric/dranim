"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NodeState;
(function (NodeState) {
    NodeState["VALID"] = "VALID";
    NodeState["ERROR"] = "ERROR";
    NodeState["INVALID"] = "INVALID";
})(NodeState = exports.NodeState || (exports.NodeState = {}));
var SocketType;
(function (SocketType) {
    SocketType["INPUT"] = "INPUT";
    SocketType["OUTPUT"] = "OUTPUT";
})(SocketType = exports.SocketType || (exports.SocketType = {}));
var DataType;
(function (DataType) {
    DataType["DATASET"] = "Dataset";
    DataType["NUMBER"] = "Number";
    DataType["STRING"] = "String";
})(DataType = exports.DataType || (exports.DataType = {}));
var CalculationProcessState;
(function (CalculationProcessState) {
    CalculationProcessState["STARTED"] = "STARTED";
    CalculationProcessState["PROCESSING"] = "PROCESSING";
    CalculationProcessState["ERROR"] = "ERROR";
    CalculationProcessState["SUCCESSFUL"] = "SUCCESSFUL";
})(CalculationProcessState = exports.CalculationProcessState || (exports.CalculationProcessState = {}));
