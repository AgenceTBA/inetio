'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var RaceSessionSchema = new Schema({
    idCircuit: String,
    email: String,
    nom: String,
    startingPoint: {
      longitude: Number,
      latitude: Number
    },
    parcours: [{
      longitude: Number,
      latitude: Number
    }],
    bestTime: Number,
    vMax: Number,
    round: Number,
    bestAngler: Number,
    date: { type: Date, default: Date.now },
  active: Boolean
});

module.exports = mongoose.model('RaceSession', RaceSessionSchema);
