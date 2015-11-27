angular.module('app')

.controller('MainCtrl', function($scope, Auth, $state,$cordovaDeviceMotion) {
$scope.$on('$ionicView.enter', function() {
  	$scope.user = Auth.getCurrentUser();
 })
  	console.log($scope.user)
  	$scope.go = function (url) {
  	  $state.go(url)
  	}

  	$scope.signout = function () {
  	  Auth.logout()
  	  $state.go("login")
  	}



});