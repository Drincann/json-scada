﻿/* 
 * OPC-UA Client Protocol driver for {json:scada}
 * {json:scada} - Copyright (c) 2020-2021 - Ricardo L. Olsen
 * This file is part of the JSON-SCADA distribution (https://github.com/riclolsen/json-scada).
 * 
 * This program is free software: you can redistribute it and/or modify  
 * it under the terms of the GNU General Public License as published by  
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Diagnostics;

namespace OPCUAClientDriver
{
    partial class MainClass
    {
        static public SortedSet<string>InsertedTags = new SortedSet<string>();

        // This process updates acquired values in the mongodb collection for realtime data
        static public async void ProcessMongo(JSONSCADAConfig jsConfig)
        {
            do
            {
                try
                {
                    var Client = ConnectMongoClient(jsConfig);
                    var DB = Client.GetDatabase(jsConfig.mongoDatabaseName);
                    var collection =
                        DB.GetCollection<rtData>(RealtimeDataCollectionName);
                    var collection_cmd =
                        DB
                            .GetCollection
                            <rtCommand>(CommandsQueueCollectionName);

                    Log("MongoDB Update Thread Started...");

                    var listWrites = new List<WriteModel<rtData>>();
                    do
                    {
                        //if (LogLevel >= LogLevelBasic && OPCDataQueue.Count > 0)
                        //  Log("MongoDB - Data queue size: " +  OPCDataQueue.Count, LogLevelBasic);

                        // Log("1");

                        bool isMongoLive =
                            DB
                                .RunCommandAsync((Command<BsonDocument>)
                                "{ping:1}")
                                .Wait(1000);
                        if (!isMongoLive)
                            throw new Exception("Error on MongoDB connection ");

                        // Log("2");
                        IEC_CmdAck ia;
                        if (OPCCmdAckQueue.Count > 0)
                        while (OPCCmdAckQueue.TryDequeue(out ia))
                        {
                            var filter1 =
                                Builders<rtCommand>
                                    .Filter
                                    .Eq(m => m.protocolSourceConnectionNumber,
                                    ia.conn_number);
                            var filter2 =
                                Builders<rtCommand>
                                    .Filter
                                    .Eq(m => m.protocolSourceObjectAddress,
                                    ia.object_address);
                            var filter =
                                Builders<rtCommand>
                                    .Filter
                                    .And(filter1, filter2);

                            var update =
                                Builders<rtCommand>
                                    .Update
                                    .Set(m => m.ack, ia.ack)
                                    .Set(m => m.ackTimeTag, ia.ack_time_tag);

                            // sort by priority then by insert order
                            var sort =
                                Builders<rtCommand>.Sort.Descending("$natural");

                            var options =
                                new FindOneAndUpdateOptions<rtCommand, rtCommand
                                >();
                            options.IsUpsert = false;
                            options.Sort = sort;
                            await collection_cmd
                                .FindOneAndUpdateAsync(filter, update, options);
                        }
                        // Log("3");

                        Stopwatch stopWatch = new Stopwatch();
                        stopWatch.Start();

                        OPC_Value iv;
                        while (!OPCDataQueue.IsEmpty && OPCDataQueue.TryPeek(out iv) && OPCDataQueue.TryDequeue(out iv))
                        {
                            // Log("3.1");
                            DateTime tt = DateTime.MinValue;
                            BsonValue bsontt = BsonNull.Value;
                            try
                            {
                                if (iv.hasSourceTimestamp)
                                {
                                    bsontt = BsonValue.Create(iv.sourceTimestamp);
                                }
                            }
                            catch
                            {
                                tt = DateTime.MinValue;
                                bsontt = BsonNull.Value;
                            }

                            BsonDocument valJSON = new BsonDocument();
                            try
                            {
                                valJSON = BsonDocument.Parse(iv.valueJson);
                            }
                            catch (Exception e)
                            {
                                Log(iv.conn_name + " - " + e.Message);
                            }

                            // Log("3.2");

                            if (iv.selfPublish)
                            {
                                string tag = TagFromOPCParameters(iv);
                                if (!InsertedTags.Contains(tag))
                                {
                                    // look for the tag
                                    var task = await collection.FindAsync<rtData>(new BsonDocument {
                                        {
                                            "tag", TagFromOPCParameters(iv)
                                        }
                                    });
                                    List<rtData> list = await task.ToListAsync();
                                    // await Task.Delay(10);
                                    //Thread.Yield();
                                    //Thread.Sleep(1);

                                    InsertedTags.Add(tag);
                                    if (list.Count == 0)
                                    {
                                        Log(iv.conn_name + " - INSERT - " + iv.address);
                                        // hash to create keys
                                        var id = HashStringToInt(iv.address);
                                        var insert = newRealtimeDoc(iv, id);
                                        int conn_index = 0;
                                        // normal for loop
                                        for (int index = 0; index < OPCUAconns.Count; index++)
                                        {
                                            if (OPCUAconns[index].protocolConnectionNumber == iv.conn_number) 
                                                conn_index = index;
                                        }
                                        insert.protocolSourcePublishingInterval = OPCUAconns[conn_index].autoCreateTagPublishingInterval;
                                        insert.protocolSourceSamplingInterval = OPCUAconns[conn_index].autoCreateTagSamplingInterval;
                                        insert.protocolSourceQueueSize = OPCUAconns[conn_index].autoCreateTagQueueSize;
                                        listWrites
                                            .Add(new InsertOneModel<rtData>(insert));
                                    }
                                }
                            }

                            //below code will update one record of the data
                            var update =
                                new BsonDocument {
                                    {
                                        "$set",
                                        new BsonDocument {
                                            {
                                                "sourceDataUpdate",
                                                new BsonDocument {
                                                    {
                                                        "valueBsonAtSource", valJSON
                                                    },
                                                    {
                                                        "valueAtSource",
                                                        BsonDouble
                                                            .Create(iv.value)
                                                    },
                                                    {
                                                        "valueStringAtSource",
                                                        BsonString
                                                            .Create(iv.valueString)
                                                    },
                                                    {
                                                        "asduAtSource",
                                                        BsonString
                                                            .Create(iv.asdu.ToString())
                                                    },
                                                    {
                                                        "causeOfTransmissionAtSource",
                                                        BsonString.Create(iv.cot.ToString())
                                                    },
                                                    {
                                                        "timeTagAtSource",
                                                        bsontt
                                                    },
                                                    {
                                                        "timeTagAtSourceOk",
                                                        BsonBoolean
                                                            .Create(iv.hasSourceTimestamp)
                                                    },
                                                    {
                                                        "timeTag",
                                                        BsonValue
                                                            .Create(iv
                                                                .serverTimestamp)
                                                    },
                                                    {
                                                        "notTopicalAtSource",
                                                        BsonBoolean
                                                            .Create(false)
                                                    },
                                                    {
                                                        "invalidAtSource",
                                                        BsonBoolean
                                                            .Create(!iv
                                                                .quality
                                                                )
                                                    },
                                                    {
                                                        "overflowAtSource",
                                                        BsonBoolean
                                                            .Create(false)
                                                    },
                                                    {
                                                        "blockedAtSource",
                                                        BsonBoolean
                                                            .Create(false)
                                                    },
                                                    {
                                                        "substitutedAtSource",
                                                        BsonBoolean
                                                            .Create(false)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                };

                            var filt =
                                new rtFilt
                                {
                                    protocolSourceConnectionNumber =
                                        iv.conn_number,
                                    protocolSourceCommonAddress =
                                        iv.common_address,
                                    protocolSourceObjectAddress = iv.address
                                };
                            Log("MongoDB - ADD " + iv.address + " " + iv.value,
                            LogLevelDebug);
                            // Log("3.3");

                            listWrites
                                .Add(new UpdateOneModel<rtData>(filt
                                        .ToBsonDocument(),
                                    update));

                            if (listWrites.Count >= BulkWriteLimit)
                                break;

                            if (stopWatch.ElapsedMilliseconds > 400)
                              break;

                            // Log("3.4 - Write buffer " + listWrites.Count + " Data " + OPCDataQueue.Count);

                            // give time to breath each 250 dequeues
                            //if ((listWrites.Count % 250)==0)
                            //{
                            //   await Task.Delay(10);
                            //Thread.Yield();
                            //Thread.Sleep(1);
                            //}
                        }

                        // Log("4");
                        if (listWrites.Count > 0)
                        {
                            Log("MongoDB - Bulk write " + listWrites.Count + " Data " + OPCDataQueue.Count);
                            var bulkWriteResult =
                                await collection.BulkWriteAsync(listWrites);
                            listWrites.Clear();

                            //Thread.Yield();
                            //Thread.Sleep(1);
                        }

                        if (OPCDataQueue.IsEmpty)
                        {
                            await Task.Delay(250);
                        }
                        // Log("6");
                    }
                    while (true);
                }
                catch (Exception e)
                {
                    Log("Exception Mongo");
                    Log(e);
                    Log(e
                        .ToString()
                        .Substring(0,
                        e.ToString().IndexOf(Environment.NewLine)));
                    Thread.Sleep(1000);

                    while (OPCDataQueue.Count > DataBufferLimit // do not let data queue grow more than a limit
                    )
                    {
                        Log("MongoDB - Dequeue Data", LogLevelDetailed);
                        OPC_Value iv;
                        OPCDataQueue.TryDequeue(out iv);
                    }
                }
            }
            while (true);
        }

        static Int64 HashStringToInt(string str)
        {
            MD5 md5Hasher = MD5.Create();
            var hashed = md5Hasher.ComputeHash(Encoding.UTF8.GetBytes(str));
            return -1000 - Math.Abs(BitConverter.ToInt64(hashed, 0));
        }
        static string TagFromOPCParameters(OPC_Value ov)
        {
            return ov.conn_name + ";" + ov.address;
        }
    }
}
