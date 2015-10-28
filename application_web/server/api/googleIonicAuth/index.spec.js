'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var googleIonicAuthCtrlStub = {
  index: 'googleIonicAuthCtrl.index',
  show: 'googleIonicAuthCtrl.show',
  create: 'googleIonicAuthCtrl.create',
  update: 'googleIonicAuthCtrl.update',
  destroy: 'googleIonicAuthCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var googleIonicAuthIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './googleIonicAuth.controller': googleIonicAuthCtrlStub
});

describe('GoogleIonicAuth API Router:', function() {

  it('should return an express router instance', function() {
    googleIonicAuthIndex.should.equal(routerStub);
  });

  describe('GET /api/googleIonicAuths', function() {

    it('should route to googleIonicAuth.controller.index', function() {
      routerStub.get
        .withArgs('/', 'googleIonicAuthCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/googleIonicAuths/:id', function() {

    it('should route to googleIonicAuth.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'googleIonicAuthCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/googleIonicAuths', function() {

    it('should route to googleIonicAuth.controller.create', function() {
      routerStub.post
        .withArgs('/', 'googleIonicAuthCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/googleIonicAuths/:id', function() {

    it('should route to googleIonicAuth.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'googleIonicAuthCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/googleIonicAuths/:id', function() {

    it('should route to googleIonicAuth.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'googleIonicAuthCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/googleIonicAuths/:id', function() {

    it('should route to googleIonicAuth.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'googleIonicAuthCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
