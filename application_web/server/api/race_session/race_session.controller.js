/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/race_sessions              ->  index
 * POST    /api/race_sessions              ->  create
 * GET     /api/race_sessions/:id          ->  show
 * PUT     /api/race_sessions/:id          ->  update
 * DELETE  /api/race_sessions/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var RaceSession = require('./race_session.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync().spread(function (updated) {
      return updated;
    });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.removeAsync().then(function () {
        res.status(204).end();
      });
    }
  };
}

// Gets a list of RaceSessions
exports.index = function (req, res) {
RaceSession.find({email: req.query.email}, function (err, comms) {
  if (err) { throw err; }
  // comms est un tableau de hash
  console.log(comms);
  res.send(comms)
});


};

// Gets a single RaceSession from the DB
exports.show = function (req, res) {
//  RaceSession.findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(responseWithResult(res))['catch'](handleError(res));
RaceSession.find({idCircuit: req.params.id}, function (err, comms) {
  if (err) { throw err; }
  // comms est un tableau de hash
  console.log(comms);
  res.send(comms)
});

};

// Creates a new RaceSession in the DB
exports.create = function (req, res) {
  RaceSession.createAsync(req.body).then(responseWithResult(res, 201))['catch'](handleError(res));
};

// Updates an existing RaceSession in the DB
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  RaceSession.findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(responseWithResult(res))['catch'](handleError(res));
};

// Deletes a RaceSession from the DB
exports.destroy = function (req, res) {
  RaceSession.findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(removeEntity(res))['catch'](handleError(res));
};
//# sourceMappingURL=race_session.controller.js.map
