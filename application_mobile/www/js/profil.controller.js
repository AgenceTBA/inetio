angular.module('app')

.controller('ProfilCtrl', function($scope, Auth, $state, $http) {
  	$scope.user = Auth.getCurrentUser();
  	$scope.go = function (url) {
  	  $state.go(url)
  	}

  	$scope.signout = function () {
  	  Auth.logout()
  	  $state.go("app.login")
  	}
  

      $http.get('http://inetio.coolcode.fr/api/race_sessions/', {params : {email: $scope.user.email}}).then(function (res){
      	$scope.user['sessions'] = res.data
	})	
});