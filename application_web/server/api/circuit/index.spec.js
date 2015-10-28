'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var circuitCtrlStub = {
  index: 'circuitCtrl.index',
  show: 'circuitCtrl.show',
  create: 'circuitCtrl.create',
  update: 'circuitCtrl.update',
  destroy: 'circuitCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var circuitIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './circuit.controller': circuitCtrlStub
});

describe('Circuit API Router:', function() {

  it('should return an express router instance', function() {
    circuitIndex.should.equal(routerStub);
  });

  describe('GET /api/circuits', function() {

    it('should route to circuit.controller.index', function() {
      routerStub.get
        .withArgs('/', 'circuitCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/circuits/:id', function() {

    it('should route to circuit.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'circuitCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/circuits', function() {

    it('should route to circuit.controller.create', function() {
      routerStub.post
        .withArgs('/', 'circuitCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/circuits/:id', function() {

    it('should route to circuit.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'circuitCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/circuits/:id', function() {

    it('should route to circuit.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'circuitCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/circuits/:id', function() {

    it('should route to circuit.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'circuitCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
