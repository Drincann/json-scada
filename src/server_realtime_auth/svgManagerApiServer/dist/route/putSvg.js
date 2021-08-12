"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putSvg = void 0;
const lodash_1 = __importDefault(require("lodash"));
const SvgFolderManager_1 = require("../service/SvgFolderManager");
const managerService = SvgFolderManager_1.SvgFolderManager.getInstance();
const putSvg = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = lodash_1.default.isEmpty(ctx.request.body) ? ctx.query : ctx.request.body;
        yield managerService.updateSvg(lodash_1.default.pick(body, ['filename', 'updater.fileContent', 'updater.filename']));
        ctx.body = { data: undefined, error: false, message: 'ok' };
        ctx.status = 200;
    }
    catch (error) {
        ctx.body = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : '未知错误';
        ctx.status = 500;
    }
    finally {
        yield next();
    }
});
exports.putSvg = putSvg;
