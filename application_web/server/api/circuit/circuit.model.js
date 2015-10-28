'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var CircuitSchema = new Schema({
	nom: String,
	center: {
		longitude: Number,
		latitude: Number
	},
	date: { type: Date, default: Date.now },
	active: Boolean
});

module.exports = mongoose.model('Circuit', CircuitSchema);
