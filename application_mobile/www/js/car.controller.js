angular.module('app')

.controller('CarCtrl', function($scope, $stateParams, User, $state, Auth, $localStorage) {

    $scope.user = Auth.getCurrentUser();
    $scope.storage = $localStorage;

    $scope.go = function (url) {
      $state.go(url);
    }

    $scope.signout = function () {
      Auth.logout();
      $state.go("app.login");
    }
  
    //information récuperer
    console.log($scope.user);
    console.log("info");
    console.log($scope.storage.raceMode);

});