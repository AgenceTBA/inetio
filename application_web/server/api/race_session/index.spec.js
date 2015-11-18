'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var raceSessionCtrlStub = {
  index: 'raceSessionCtrl.index',
  show: 'raceSessionCtrl.show',
  create: 'raceSessionCtrl.create',
  update: 'raceSessionCtrl.update',
  destroy: 'raceSessionCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var raceSessionIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './race_session.controller': raceSessionCtrlStub
});

describe('RaceSession API Router:', function() {

  it('should return an express router instance', function() {
    raceSessionIndex.should.equal(routerStub);
  });

  describe('GET /api/race_sessions', function() {

    it('should route to raceSession.controller.index', function() {
      routerStub.get
        .withArgs('/', 'raceSessionCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/race_sessions/:id', function() {

    it('should route to raceSession.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'raceSessionCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/race_sessions', function() {

    it('should route to raceSession.controller.create', function() {
      routerStub.post
        .withArgs('/', 'raceSessionCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/race_sessions/:id', function() {

    it('should route to raceSession.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'raceSessionCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/race_sessions/:id', function() {

    it('should route to raceSession.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'raceSessionCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/race_sessions/:id', function() {

    it('should route to raceSession.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'raceSessionCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
