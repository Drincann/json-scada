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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgFolderManager = void 0;
const util_1 = require("../util");
const lodash_1 = __importDefault(require("lodash"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const resolve_path_1 = __importDefault(require("resolve-path"));
const hash_js_1 = __importDefault(require("hash.js"));
/**
 * 单例
 * 单一实例将监视 SvgFolder 目录, 并自动更新内存中的 svg 文件项的结构化数据 svgMap 和 svgList
 * 还提供 svg 文件的增删改查
 */
class SvgFolderManager {
    /**
     * @param svgFolder svg 目录, 从 util/env 下获取
     */
    constructor(svgFolder) {
        // svgList 由 svgMap 生成, svgMap 主要用于查询和修改
        this.svgMap = {};
        this.svgList = [];
        this.svgFolder = svgFolder;
        this.startWatch(svgFolder);
    }
    static getInstance() {
        return SvgFolderManager.single;
    }
    getSvgList() {
        return this.svgList;
    }
    addSvg({ filename, fileContent }) {
        return __awaiter(this, void 0, void 0, function* () {
            filename = this.resolveSvgFilename(filename);
            if (this.svgMap[filename] != null) {
                throw new Error('文件名已存在');
            }
            const filePath = resolve_path_1.default(this.svgFolder, filename);
            yield promises_1.default.writeFile(filePath, fileContent);
        });
    }
    deleteSvg({ filename }) {
        return __awaiter(this, void 0, void 0, function* () {
            filename = this.resolveSvgFilename(filename);
            if (this.svgMap[filename] == null) {
                throw new Error('文件名不存在');
            }
            const filePath = resolve_path_1.default(this.svgFolder, filename);
            yield promises_1.default.unlink(filePath);
        });
    }
    updateSvg({ filename, updater }) {
        return __awaiter(this, void 0, void 0, function* () {
            filename = this.resolveSvgFilename(filename);
            if (updater === null || updater === void 0 ? void 0 : updater.filename)
                updater.filename = this.resolveSvgFilename(updater.filename);
            if (this.svgMap[filename] == null) {
                throw new Error('文件名不存在');
            }
            const filePath = resolve_path_1.default(this.svgFolder, filename);
            let newFilePath = null;
            if ((updater === null || updater === void 0 ? void 0 : updater.filename) != null) {
                newFilePath = resolve_path_1.default(this.svgFolder, updater.filename);
                yield promises_1.default.rename(filePath, newFilePath);
            }
            if (updater === null || updater === void 0 ? void 0 : updater.fileContent) {
                yield promises_1.default.writeFile(newFilePath !== null && newFilePath !== void 0 ? newFilePath : filePath, updater.fileContent);
            }
        });
    }
    resolveSvgFilename(filename) {
        const extname = path_1.default.extname(filename);
        if (extname != '.svg') {
            filename += extname == '.' ? 'svg' : '.svg';
        }
        return filename;
    }
    generateSvgList() {
        return lodash_1.default.sortBy(lodash_1.default.values(this.svgMap), 'birthtime');
    }
    startWatch(svgFolder) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.syncMapAndList();
            try {
                for (var _b = __asyncValues(promises_1.default.watch(svgFolder)), _c; _c = yield _b.next(), !_c.done;) {
                    const event = _c.value;
                    this.onFileChange(event.eventType, event.filename /* 标准库的类型声明有误, pr 等待 merge https://github.com/DefinitelyTyped/DefinitelyTyped/pull/55033 */);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    /**
     * 文件变动回调
     * 由于 fs.watch 的不确定的平台差异性, 这个方法没有使用 eventType 参数, 而
     * 是进行通用的目录缓存同步
     * 每当变动发生, 我们要保证
     * 1. 新增的 svg 文件项被添加到 map
     * 2. 将删除的 svg 文件从 map 中移除
     * 3. 对已存在的被改变的 svg 内容 hash 进行更新
     * 我们是这样做的, 若文件存在且为 svg, 则说明文件已被改变(因为他没有被 rename), 此时
     * 更新其 hash, 此时保证了 3.
     * 然后对任何情况, 分别目录和缓存求差集(syncMapAndList method), 更新 map,
     * 此时保证了 1. 2.
     * @param eventType
     * @param filename
     */
    onFileChange(eventType, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = filename instanceof Buffer
                ? resolve_path_1.default(this.svgFolder, filename.toString())
                : resolve_path_1.default(this.svgFolder, filename);
            filename = filename instanceof Buffer ? filename.toString() : filename;
            // update hash
            if (yield util_1.fsExt.isFileExist(filePath)) {
                const fileStat = yield promises_1.default.stat(filePath);
                if (path_1.default.extname(filePath) == '.svg' && fileStat.isFile()) {
                    const fileContent = (yield promises_1.default.readFile(filePath)).toString();
                    this.svgMap[filename] = {
                        filename,
                        SHA256HashHex: hash_js_1.default.sha256().update(fileContent).digest('hex'),
                        birthtime: fileStat.birthtimeMs,
                    };
                }
                else {
                    return;
                }
            }
            // sync map and list
            this.syncMapAndList();
        });
    }
    /**
     * 将 SvgFolder 指示的文件列表同步到 this.svgMap
     */
    syncMapAndList() {
        return __awaiter(this, void 0, void 0, function* () {
            const svgNamesCache = lodash_1.default.keys(this.svgMap); // or "this.svgList.map((svgInfo: SvgInfo): string => svgInfo.filename)"
            const svgNames = (yield util_1.fsExt.getDirSubNames(this.svgFolder)).filter(filename => path_1.default.extname(filename) == '.svg' /* 这里没有过滤目录项的类型 && fileStat.idFIle(), 该判断在下方进行 */);
            lodash_1.default.difference(svgNamesCache, svgNames).forEach(redundantFilename => delete this.svgMap[redundantFilename]);
            yield Promise.all(lodash_1.default.difference(svgNames, svgNamesCache).map((newFilename) => __awaiter(this, void 0, void 0, function* () {
                const filePath = resolve_path_1.default(this.svgFolder, newFilename);
                const fileStat = yield promises_1.default.stat(filePath);
                if (!fileStat.isFile())
                    return; // 这里承接上方的文件判断
                const fileContent = (yield promises_1.default.readFile(filePath)).toString();
                this.svgMap[newFilename] = {
                    filename: newFilename,
                    SHA256HashHex: hash_js_1.default.sha256().update(fileContent).digest('hex'),
                    birthtime: fileStat.birthtimeMs,
                };
            })));
            this.svgList = this.generateSvgList();
        });
    }
}
exports.SvgFolderManager = SvgFolderManager;
// 单例
SvgFolderManager.single = new SvgFolderManager(util_1.env.SvgFolder);
