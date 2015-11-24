angular.module('app')

.controller('RaceCtrl', function($scope, Auth, $state, $http, $cordovaGeolocation, $localStorage) {

    //VARIABLE GLOBAL
    $scope.user = Auth.getCurrentUser()
    $scope.storage = $localStorage
    $scope.CircuitComplete = [];

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
        $state.go('app.racemode')
      })
    }

    //MAIN DE LA PAGE
    $http.get('http://inetio.coolcode.fr/api/circuits').then(function (res){
      $scope.CircuitComplete = res.data;
      $scope.listCircuit = $scope.CircuitComplete;
      //$scope.currentPosition()
    })
});

/* ON UTILISERA PAS DE MAP ICI 
  //FONCTION QUI GERE LA MAP
  $scope.refreshMap = function (lat, long) {
    var myLatlng = new google.maps.LatLng(lat, long);
      var mapOptions = {
          streetViewControl: true,
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.TERRAIN
      };

      var map = new google.maps.Map(document.getElementById('map'),
          mapOptions);

      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          icon: './img/been.png'
      });

      for (var c in $scope.listCircuit){
        marker.push({
          position: new google.maps.LatLng($scope.listCircuit[c].center.longitude, $scope.listCircuit[c].center.latitude),
          map: map,
        })
      }

      $scope.map = map;
  }
  $scope.lat = 0
  $scope.currentPosition = function () {
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        console.log(position)
        var lat  = position.coords.latitude
        var long = position.coords.longitude
        $scope.refreshMap(lat, long)
      }, function(err) {
        if (err) console.log(err)
      });
  }
*/