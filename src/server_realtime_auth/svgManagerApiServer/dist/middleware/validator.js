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
exports.bodyValidator = void 0;
const lodash_1 = __importDefault(require("lodash"));
const index_1 = require("../util/index");
/**
 * 参数验证器
 * @param validator aproba 的验证字符串
 * @param pick 对 ctx.request.body 的属性值按照该参数的顺序进行拣选
 * @returns Koa 中间件
 */
function bodyValidator(validator, pick) {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const body = lodash_1.default.isEmpty(ctx.request.body) ? ctx.query : ctx.request.body;
            index_1.aproba(validator, (_a = pick.map) === null || _a === void 0 ? void 0 : _a.call(pick, fieldname => lodash_1.default.get(body, fieldname)));
            yield next();
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = error.message;
        }
    });
}
exports.bodyValidator = bodyValidator;
