/**
 * Circuit model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var Circuit = require('./circuit.model');
var CircuitEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CircuitEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Circuit.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    CircuitEvents.emit(event + ':' + doc._id, doc);
    CircuitEvents.emit(event, doc);
  }
}

module.exports = CircuitEvents;
