"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formToMap = function (form) {
    return new Map(form.map(function (f) { return [f.name, f.value]; }));
};
exports.getOrDefault = function (form, name, defaultVal) {
    var existingVal = form.get(name);
    if (existingVal) {
        return JSON.parse(existingVal);
    }
    else {
        return defaultVal;
    }
};
