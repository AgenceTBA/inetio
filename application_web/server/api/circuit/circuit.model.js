'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var CircuitSchema = new Schema({
	nom: String,
	auteur: String,
	center: {
		longitude: Number,
		latitude: Number
	},
    parcours: [{
      lng: Number,
      lat: Number
    }],
	date: { type: Date, default: Date.now },
	isDrag: Number,
	active: Boolean
});

module.exports = mongoose.model('Circuit', CircuitSchema);
