'use strict';

var app = require('../..');
var request = require('supertest');

var newCircuit;

describe('Circuit API:', function() {

  describe('GET /api/circuits', function() {
    var circuits;

    beforeEach(function(done) {
      request(app)
        .get('/api/circuits')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          circuits = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      circuits.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/circuits', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/circuits')
        .send({
          name: 'New Circuit',
          info: 'This is the brand new circuit!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newCircuit = res.body;
          done();
        });
    });

    it('should respond with the newly created circuit', function() {
      newCircuit.name.should.equal('New Circuit');
      newCircuit.info.should.equal('This is the brand new circuit!!!');
    });

  });

  describe('GET /api/circuits/:id', function() {
    var circuit;

    beforeEach(function(done) {
      request(app)
        .get('/api/circuits/' + newCircuit._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          circuit = res.body;
          done();
        });
    });

    afterEach(function() {
      circuit = {};
    });

    it('should respond with the requested circuit', function() {
      circuit.name.should.equal('New Circuit');
      circuit.info.should.equal('This is the brand new circuit!!!');
    });

  });

  describe('PUT /api/circuits/:id', function() {
    var updatedCircuit

    beforeEach(function(done) {
      request(app)
        .put('/api/circuits/' + newCircuit._id)
        .send({
          name: 'Updated Circuit',
          info: 'This is the updated circuit!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedCircuit = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCircuit = {};
    });

    it('should respond with the updated circuit', function() {
      updatedCircuit.name.should.equal('Updated Circuit');
      updatedCircuit.info.should.equal('This is the updated circuit!!!');
    });

  });

  describe('DELETE /api/circuits/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/circuits/' + newCircuit._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when circuit does not exist', function(done) {
      request(app)
        .delete('/api/circuits/' + newCircuit._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
