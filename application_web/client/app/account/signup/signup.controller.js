'use strict';

angular.module('applicationWebApp')
  .controller('SignupCtrl', function($scope, Auth, $state) {
    $scope.user = {};
    $scope.errors = {};
    $scope.user.sexe = 'homme'
    $scope.register = function(form) {
      $scope.submitted = true;

      if (form.$valid) {
        Auth.createUser({
          nom: $scope.user.nom ,
          prenom: $scope.user.prenom,
          date: $scope.start,
          image : function () {
            if ($flow.files[0])
              return new Buffer($flow.files[0], "base64")
            else
              return null
          },
          sexe: $scope.user.sexe,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then(function() {
          // Account created, redirect to home
          $state.go('main');
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
