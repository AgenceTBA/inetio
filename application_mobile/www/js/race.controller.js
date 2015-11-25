angular.module('app')

.controller('RaceCtrl', function($scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, Utils) {

    //VARIABLE GLOBAL
    $scope.user = Auth.getCurrentUser()
    $scope.storage = $localStorage
    $scope.CircuitComplete = [];
    $scope.listCircuit = [];

    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.listCircuit = $scope.CircuitComplete.filter(function(item) {
                var ft = $scope.filterOptions.filterText.toLowerCase();
                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            });
            if (!$scope.$$phase) {  
                $scope.$apply();
            }
        }
    }, true);

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };

    //FONCTION NAVIGATION
    $scope.go = function (url) {
      $state.go(url)
    }

    $scope.signout = function () {
      Auth.logout()
      $state.go("login")
    }

    $scope.chosenRace = function (_idCircuit) {
      $http.get('http://inetio.coolcode.fr/api/circuits/'+ _idCircuit).then(function (res){
        $localStorage.raceMode = {
          infoCircuit: res.data
        }
        $state.go('app.detailmap')
      })
    }

    //MAIN DE LA PAGE
    $http.get('http://inetio.coolcode.fr/api/circuits').then(function (res){
      $scope.CircuitComplete = res.data;
      $scope.filterByPostion();
    });


    $scope.filterByPostion = function(){
      $scope.getStartingPoint(function(coord){
        for(var i in $scope.CircuitComplete){
          var distanceCircuit = Utils.getDistance(coord, $scope.CircuitComplete[i].center);
          $scope.CircuitComplete[i].distanceBrut = distanceCircuit;
          if (distanceCircuit < 1)
            $scope.CircuitComplete[i].distance = parseInt((distanceCircuit * 100)) + "m"
          else
            $scope.CircuitComplete[i].distance = parseInt(distanceCircuit) + "km"

          console.log(distanceCircuit);
          if (distanceCircuit < 10)
            $scope.listCircuit.push($scope.CircuitComplete[i]);
        }


      });
    }

    $scope.getStartingPoint = function (cb) {
        var options = {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        };
        $cordovaGeolocation.getCurrentPosition(options).then(function (pos) {
          cb({ 'latitude' : pos.coords.latitude, 'longitude' : pos.coords.longitude })
        })
    }
});