"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_body_1 = __importDefault(require("koa-body"));
const middleware_1 = require("./middleware");
const route_1 = require("./route");
const server = new koa_1.default();
const router = new koa_router_1.default();
const port = 8081;
exports.config = {
    // 用于 json-scada 反向代理
    address: `http://localhost:${port}`,
};
server
    .use(middleware_1.statusSetter)
    .use(koa_body_1.default())
    .use(middleware_1.apiPacker)
    /**
     * api
     */
    .use(
/**
 * interface api {
 *   data: any;
 *   error: boolean;
 *   message: dstring;
 * }
 */
router
    .get('/svg', route_1.getSvgList)
    .put('/svg', middleware_1.bodyValidator('SSS', ['filename', 'updater.fileContent', 'updater.filename']), route_1.putSvg)
    .delete('/svg', middleware_1.bodyValidator('S', ['filename']), route_1.deleteSvg)
    .post('/svg', middleware_1.bodyValidator('SS', ['filename', 'fileContent']), route_1.postSvg)
    .routes())
    .use(router.allowedMethods())
    .listen(port);
