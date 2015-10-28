'use strict';

angular.module('applicationWebApp')
  .controller('OauthButtonsCtrl', function($window) {
    this.loginOauth = function(provider) {
    	console.log('/auth/' + provider)
      $window.location.href = '/auth/' + provider;
    };
  });
