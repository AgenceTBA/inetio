angular.module('app')

.controller('RaceCtrl', function($scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, Utils) {

    //VARIABLE GLOBAL
    $scope.user = Auth.getCurrentUser();
    $scope.storage = $localStorage;
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

    $scope.chosenRace = function (_idCircuit) {
      $http.get('http://inetio.coolcode.fr/api/circuits/'+ _idCircuit).then(function (res){
        $localStorage.raceMode = {
          infoCircuit: res.data
        }
        $state.go('app.detailmap')
      });
    }

    //MAIN DE LA PAGE
    $http.get('http://inetio.coolcode.fr/api/circuits').then(function (res){
      $scope.CircuitComplete = res.data;
      $scope.filterByPostion();
    });


    $scope.filterByPostion = function(){
        Utils.getPosition(function(coord) {
            for(var i in $scope.CircuitComplete){
                console.log($scope.CircuitComplete[i]);
                var distanceCircuit = Utils.getDistance(coord, $scope.CircuitComplete[i].center);
                $scope.CircuitComplete[i].distanceBrut = distanceCircuit;
          
                if (distanceCircuit < 1)
                    $scope.CircuitComplete[i].distance = Utils.getDistanceDisplay(distanceCircuit);
                else
                    $scope.CircuitComplete[i].distance = Utils.getDistanceDisplay(distanceCircuit);

                if (distanceCircuit < 10)
                    $scope.listCircuit.push($scope.CircuitComplete[i]);
            }
        });
    }
});