/** InfluxDB v2 URL */
const url = process.env['INFLUX_URL'] || 'http://localhost:8086'
/** InfluxDB authorization token */
const token = process.env['INFLUX_TOKEN'] || 'my-token'
/** Organization within InfluxDB  */
const org = process.env['INFLUX_ORG'] || 'adminorg'
/**InfluxDB bucket used in examples  */
const bucket = process.env['INFLUX_BUCKET'] || 'my-bucket'
// ONLY onboarding example
/**InfluxDB user  */
const username = process.env['INFLUX_USER'] || 'admin'
/**InfluxDB password  */
const password = process.env['INFLUX_PWD'] || 'influxadmin'
/** mongodb connection str **/
const mongostr = process.env['MONGO_STR'] || 'mongodb://mongors1:27017'
/** mongodb connection str **/
const mongodbname = process.env['MONGO_DB_NAME'] || 'json_scada'
export {
    url,
    token,
    org,
    bucket,
    username,
    password,
    mongostr,
    mongodbname,
}