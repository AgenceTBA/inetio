'use strict';

import User from './user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function() {
    res.status(statusCode).end();
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.findAsync({}, '-salt -hashedPassword')
    .then(function(users) {
      res.status(200).json(users);
    })
    .catch(handleError(res));
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
  var newUser = new User(req.body);
  console.log("-------")
  console.log(req.body.newGoogleUser)
  console.log("-------")

  if (req.body.newGoogleUser){
  if (req.body.newGoogleUser.provider && req.body.newGoogleUser.provider == 'google'){
    console.log(req.body.newGoogleUser.google.id)
    User.findOneAsync({
      'google.id': req.body.newGoogleUser.google.id
    })
      .then(function(user) {
        if (!user) {
          user = new User({
            name: req.body.newGoogleUser.google.displayName,
            email: req.body.newGoogleUser.google.emails[0].value,
            role: 'user',
            username: req.body.newGoogleUser.google.emails[0].value.split('@')[0],
            provider: 'google',
            google: req.body.newGoogleUser.google
          });
          user.saveAsync()
            .spread(function(user) {
              var token = jwt.sign({ _id: user._id }, config.secrets.session, {
                expiresInMinutes: 60 * 5
              });
              res.json({ token: token });
            })
            .catch(validationError(res))

        } else {
              var token = jwt.sign({ _id: user._id }, config.secrets.session, {
                expiresInMinutes: 60 * 5
              });
              res.json({ token: token });
        }
      })
      .catch(function(err) {
              res.json({ token: '' });
      });


  } else {
    newUser.provider = 'local';
    newUser.role = 'user';
    console.log(newUser);
    newUser.saveAsync()
      .spread(function(user) {
        var token = jwt.sign({ _id: user._id }, config.secrets.session, {
          expiresInMinutes: 60 * 5
        });
        res.json({ token: token });
      })
      .catch(validationError(res));
  }
  } else {
    newUser.provider = 'local';
    newUser.role = 'user';
    console.log(newUser);
    newUser.saveAsync()
      .spread(function(user) {
        var token = jwt.sign({ _id: user._id }, config.secrets.session, {
          expiresInMinutes: 60 * 5
        });
        res.json({ token: token });
      })
      .catch(validationError(res));
  }

};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
  var userId = req.params.id;

  User.findByIdAsync(userId)
    .then(function(user) {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(function(err) {
      return next(err);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemoveAsync(req.params.id)
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findByIdAsync(userId)
    .then(function(user) {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.saveAsync()
          .then(function() {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
};


// Updates an existing Circuit in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  User.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;

  User.findOneAsync({ _id: userId }, '-salt -hashedPassword')
    .then(function(user) { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(function(err) {
      return next(err);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
