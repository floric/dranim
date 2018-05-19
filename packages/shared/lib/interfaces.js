"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NodeState;
(function (NodeState) {
    NodeState["VALID"] = "VALID";
    NodeState["ERROR"] = "ERROR";
    NodeState["INVALID"] = "INVALID";
})(NodeState = exports.NodeState || (exports.NodeState = {}));
var CalculationProcessState;
(function (CalculationProcessState) {
    CalculationProcessState["STARTED"] = "STARTED";
    CalculationProcessState["PROCESSING"] = "PROCESSING";
    CalculationProcessState["ERROR"] = "ERROR";
    CalculationProcessState["SUCCESSFUL"] = "SUCCESSFUL";
})(CalculationProcessState = exports.CalculationProcessState || (exports.CalculationProcessState = {}));
