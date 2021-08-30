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
const influxdb_client_1 = require("@influxdata/influxdb-client");
const env_1 = require("./env");
const mongodb_1 = require("mongodb");
const { hostname } = require('os');
const writeApi = new influxdb_client_1.InfluxDB({ url: env_1.url, token: env_1.token }).getWriteApi(env_1.org, env_1.bucket, 'ns');
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (yield mongodb_1.MongoClient.connect(env_1.mongostr))
            .db(env_1.mongodbname)
            .collection('realtimeData')
            .watch([{
                $project: { documentKey: false }
            }, {
                $match: {
                    $and: [{
                            'fullDocument.tag': { $exists: true }
                        }, {
                            'updateDescription.updatedFields.value': { $exists: true }
                        }, {
                            $or: [{ operationType: 'update' }]
                        }]
                }
            }], { fullDocument: 'updateLookup' })
            .on('change', (doc) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            writeApi.writePoint(new influxdb_client_1.Point('mem')
                .tag('tag', (_a = doc.fullDocument) === null || _a === void 0 ? void 0 : _a.tag)
                .floatField('value', (_b = doc.updateDescription) === null || _b === void 0 ? void 0 : _b.updatedFields.value));
            yield writeApi.flush();
            console.log(`update tag <${(_c = doc.fullDocument) === null || _c === void 0 ? void 0 : _c.tag}> value <${(_d = doc.updateDescription) === null || _d === void 0 ? void 0 : _d.updatedFields.value}> to influxdb`);
        }));
        console.log('mongo2influx mongodb connect successfully!');
    }
    catch (error) {
        console.log(error.message);
    }
}))();
//# sourceMappingURL=index.js.map