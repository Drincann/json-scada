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
exports.statusSetter = void 0;
/**
 * 若已修改过 status, 则不作任何操作
 * 若未修改过 status, 检查 body 是否具有值, 若具有则 status 置 200
 */
const statusSetter = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield next();
    if (ctx.status != 404)
        return;
    if (ctx.body != null) {
        ctx.status = 200;
    }
});
exports.statusSetter = statusSetter;
