"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aproba = exports.fsExt = exports.env = void 0;
var env_1 = require("./env");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return env_1.env; } });
var fs_ext_1 = require("./fs-ext");
Object.defineProperty(exports, "fsExt", { enumerable: true, get: function () { return fs_ext_1.fsExt; } });
const aproba_1 = __importDefault(require("./aproba"));
exports.aproba = aproba_1.default;
