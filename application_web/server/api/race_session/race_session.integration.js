'use strict';

var app = require('../..');
var request = require('supertest');

var newRaceSession;

describe('RaceSession API:', function() {

  describe('GET /api/race_sessions', function() {
    var raceSessions;

    beforeEach(function(done) {
      request(app)
        .get('/api/race_sessions')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          raceSessions = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      raceSessions.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/race_sessions', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/race_sessions')
        .send({
          name: 'New RaceSession',
          info: 'This is the brand new raceSession!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newRaceSession = res.body;
          done();
        });
    });

    it('should respond with the newly created raceSession', function() {
      newRaceSession.name.should.equal('New RaceSession');
      newRaceSession.info.should.equal('This is the brand new raceSession!!!');
    });

  });

  describe('GET /api/race_sessions/:id', function() {
    var raceSession;

    beforeEach(function(done) {
      request(app)
        .get('/api/race_sessions/' + newRaceSession._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          raceSession = res.body;
          done();
        });
    });

    afterEach(function() {
      raceSession = {};
    });

    it('should respond with the requested raceSession', function() {
      raceSession.name.should.equal('New RaceSession');
      raceSession.info.should.equal('This is the brand new raceSession!!!');
    });

  });

  describe('PUT /api/race_sessions/:id', function() {
    var updatedRaceSession

    beforeEach(function(done) {
      request(app)
        .put('/api/race_sessions/' + newRaceSession._id)
        .send({
          name: 'Updated RaceSession',
          info: 'This is the updated raceSession!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedRaceSession = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRaceSession = {};
    });

    it('should respond with the updated raceSession', function() {
      updatedRaceSession.name.should.equal('Updated RaceSession');
      updatedRaceSession.info.should.equal('This is the updated raceSession!!!');
    });

  });

  describe('DELETE /api/race_sessions/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/race_sessions/' + newRaceSession._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when raceSession does not exist', function(done) {
      request(app)
        .delete('/api/race_sessions/' + newRaceSession._id)
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
