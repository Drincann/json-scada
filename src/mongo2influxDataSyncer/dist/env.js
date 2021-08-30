"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbname = exports.mongostr = exports.password = exports.username = exports.bucket = exports.org = exports.token = exports.url = void 0;
/** InfluxDB v2 URL */
const url = process.env['INFLUX_URL'] || 'http://localhost:8086';
exports.url = url;
/** InfluxDB authorization token */
const token = process.env['INFLUX_TOKEN'] || 'my-token';
exports.token = token;
/** Organization within InfluxDB  */
const org = process.env['INFLUX_ORG'] || 'adminorg';
exports.org = org;
/**InfluxDB bucket used in examples  */
const bucket = process.env['INFLUX_BUCKET'] || 'my-bucket';
exports.bucket = bucket;
// ONLY onboarding example
/**InfluxDB user  */
const username = process.env['INFLUX_USER'] || 'admin';
exports.username = username;
/**InfluxDB password  */
const password = process.env['INFLUX_PWD'] || 'influxadmin';
exports.password = password;
/** mongodb connection str **/
const mongostr = process.env['MONGO_STR'] || 'mongodb://mongors1:27017';
exports.mongostr = mongostr;
/** mongodb connection str **/
const mongodbname = process.env['MONGO_DB_NAME'] || 'json_scada';
exports.mongodbname = mongodbname;
//# sourceMappingURL=env.js.map