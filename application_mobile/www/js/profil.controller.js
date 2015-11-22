angular.module('app')

.controller('ProfilCtrl', function($scope, Auth, $state) {
  	$scope.user = Auth.getCurrentUser();
  	$scope.go = function (url) {
  	  $state.go(url)
  	}

  	$scope.signout = function () {
  	  Auth.logout()
  	  $state.go("app.login")
  	}
  	
});