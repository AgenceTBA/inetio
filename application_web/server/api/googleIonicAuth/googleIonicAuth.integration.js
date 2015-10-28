'use strict';

var app = require('../..');
var request = require('supertest');

var newGoogleIonicAuth;

describe('GoogleIonicAuth API:', function() {

  describe('GET /api/googleIonicAuths', function() {
    var googleIonicAuths;

    beforeEach(function(done) {
      request(app)
        .get('/api/googleIonicAuths')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          googleIonicAuths = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      googleIonicAuths.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/googleIonicAuths', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/googleIonicAuths')
        .send({
          name: 'New GoogleIonicAuth',
          info: 'This is the brand new googleIonicAuth!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newGoogleIonicAuth = res.body;
          done();
        });
    });

    it('should respond with the newly created googleIonicAuth', function() {
      newGoogleIonicAuth.name.should.equal('New GoogleIonicAuth');
      newGoogleIonicAuth.info.should.equal('This is the brand new googleIonicAuth!!!');
    });

  });

  describe('GET /api/googleIonicAuths/:id', function() {
    var googleIonicAuth;

    beforeEach(function(done) {
      request(app)
        .get('/api/googleIonicAuths/' + newGoogleIonicAuth._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          googleIonicAuth = res.body;
          done();
        });
    });

    afterEach(function() {
      googleIonicAuth = {};
    });

    it('should respond with the requested googleIonicAuth', function() {
      googleIonicAuth.name.should.equal('New GoogleIonicAuth');
      googleIonicAuth.info.should.equal('This is the brand new googleIonicAuth!!!');
    });

  });

  describe('PUT /api/googleIonicAuths/:id', function() {
    var updatedGoogleIonicAuth

    beforeEach(function(done) {
      request(app)
        .put('/api/googleIonicAuths/' + newGoogleIonicAuth._id)
        .send({
          name: 'Updated GoogleIonicAuth',
          info: 'This is the updated googleIonicAuth!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedGoogleIonicAuth = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedGoogleIonicAuth = {};
    });

    it('should respond with the updated googleIonicAuth', function() {
      updatedGoogleIonicAuth.name.should.equal('Updated GoogleIonicAuth');
      updatedGoogleIonicAuth.info.should.equal('This is the updated googleIonicAuth!!!');
    });

  });

  describe('DELETE /api/googleIonicAuths/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/googleIonicAuths/' + newGoogleIonicAuth._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when googleIonicAuth does not exist', function(done) {
      request(app)
        .delete('/api/googleIonicAuths/' + newGoogleIonicAuth._id)
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
