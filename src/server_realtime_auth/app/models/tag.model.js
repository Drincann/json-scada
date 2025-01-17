const mongoose = require("mongoose");
const Double = require('@mongoosejs/double');

const Tag = mongoose.model(
  "Tag",  
  new mongoose.Schema({
    _id: {type: Double},
    alarmDisabled: {type: Boolean, default: false},
    alarmed: {type: Boolean, default: false},
    alarmState: {type: Double, default: -1.0},
    alerted: {type: Boolean, default: false},
    alertState: {type: String, default: ""},
    annotation: {type: String, default: ""},
    commandBlocked: {type: Boolean, default: false},
    commandOfSupervised: {type: Double, default: 0.0},
    description: {type: String, default: ""},
    eventTextFalse: {type: String, default: ""},
    eventTextTrue: {type: String, default: ""},
    formula: {type: Double, default: -1.0},
    frozen: {type: Boolean, default: false},
    frozenDetectTimeout: {type: Double, default: 0.0},
    group1: {type: String, default: ""},
    group2: {type: String, default: ""},
    group3: {type: String, default: ""},
    hihihiLimit: {type: Double, default: Number.MAX_VALUE},
    hihiLimit: {type: Double, default: Number.MAX_VALUE},
    hiLimit: {type: Double, default: Number.MAX_VALUE},
    historianDeadBand: {type: Double, default: 0.0},
    historianPeriod: {type: Double, default: 0.0},
    hysteresis: {type: Double, default: 0.0},
    invalid: {type: Boolean, default: true},    
    invalidDetectTimeout: {type: Double, default: 300.0},
    isEvent: {type: Boolean, default: false},
    kconv1: {type: Double, default: 1.0},
    kconv2: {type: Double, default: 0.0},
    loLimit: {type: Double, default: -Number.MAX_VALUE},
    loloLimit: {type: Double, default: -Number.MAX_VALUE},
    lololoLimit: {type: Double, default: -Number.MAX_VALUE},
    notes: {type: String, default: ""},
    origin: {type: String, default: "supervised"},
    overflow: {type: Boolean, default: false},
    parcels: {type: Array, default: []},
    priority: {type: Double, default: 0.0},
    protocolDestinations: {type: Array, default: []},
    protocolSourceASDU: {type: String, default: ""},
    protocolSourceCommandDuration: {type: String, default: ""},
    protocolSourceCommandUseSBO: {type: Boolean, default: false},
    protocolSourceCommonAddress: {type: String, default: ""},
    protocolSourceConnectionNumber: {type: Double, default: 0.0},
    protocolSourceObjectAddress: {type: String, default: ""},
    stateTextFalse: {type: String, default: ""},
    stateTextTrue: {type: String, default: ""},
    supervisedOfCommand: {type: Double, default: 0.0},
    tag: {type: String},
    transient: {type: Boolean, default: true},
    type: {type: String, default: "digital"},
    ungroupedDescription: {type: String, default: ""},
    unit: {type: String, default: ""},
    value: {type: Double, default: 0.0},
    valueJson: {type: Object, default: null},
    valueString: {type: String, default: ""},
    zeroDeadband: {type: Double, default: 0.0},
  }),
  "realtimeData"
);

module.exports = Tag;