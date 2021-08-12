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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSvgList = void 0;
const SvgFolderManager_1 = require("../service/SvgFolderManager");
const managerService = SvgFolderManager_1.SvgFolderManager.getInstance();
const getSvgList = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        ctx.body = managerService.getSvgList();
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
exports.getSvgList = getSvgList;
