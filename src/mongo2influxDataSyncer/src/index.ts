import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client'
import { url, token, org, bucket, mongostr, mongodbname } from './env'
import { MongoClient } from 'mongodb'
const { hostname } = require('os')

const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ns')
    ;
(async () => {
    try {
        (await MongoClient.connect(mongostr))
            .db(mongodbname)
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
            .on('change', async doc => {
                writeApi.writePoint(new Point('mem')
                    .tag('tag', doc.fullDocument?.tag)
                    .floatField('value', doc.updateDescription?.updatedFields.value))

                await writeApi.flush()
                console.log(`update tag <${doc.fullDocument?.tag}> value <${doc.updateDescription?.updatedFields.value}> to influxdb`)
            })
        console.log('mongo2influx mongodb connect successfully!');
    } catch (error) {
        console.log(error.message);
    }
})()