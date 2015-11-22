angular.module('app')

.controller('MainCtrl', function($scope, Auth, $state,$cordovaDeviceMotion) {
  	$scope.user = Auth.getCurrentUser();

  	$scope.go = function (url) {
  	  $state.go(url)
  	}

  	$scope.signout = function () {
  	  Auth.logout()
  	  $state.go("login")
  	}



});