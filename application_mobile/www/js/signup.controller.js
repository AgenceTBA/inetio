'use strict';

angular.module('app')
  .controller('SignupCtrl', function($scope, Auth, $state) {
    $scope.form = {};
    $scope.errors = {};
    $scope.form.sexe = 'homme'
    $scope.register = function(form) {

      console.log(form);
      $scope.submitted = true;

      if (form.$valid) {
        Auth.createUser({
          nom: form.nom ,
          prenom: form.prenom,
          date: form.start,
          sexe: form.sexe,
          email: form.email,
          password: form.password
        })
        .then(function() {
          Auth.
          // Account created, redirect to home
          $state.go('app.main');
        })
        .catch(function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };




  });
