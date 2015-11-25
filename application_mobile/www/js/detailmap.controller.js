angular.module('app')

.controller('DetailMapCtrl', function(Utils, $timeout, $interval, $scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, chronoService, $ionicLoading,$rootScope, $ionicPopup, $timeout,$cordovaDeviceMotion) {
    //VARIABLE GLOBAL

    $scope.user = Auth.getCurrentUser()
    $scope.storage = $localStorage
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
    $scope.initialisationMap = function (pos) {
        $scope.myLatlng = new google.maps.LatLng(pos.latitude, pos.longitude);
        $scope.mapOptions = {
            center: $scope.myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }; 
        $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions); 
    }
    $scope.fullDistance = function (tab) {
        var m  = 0
        for (var i=0; i < tab.length; i ++){
            if (tab[i + 1]){
                m += Utils.getDistance(tab[i], tab[i + 1])
            }
        }
        return m;
    } 
    $http.get('http://inetio.coolcode.fr/api/race_sessions/' + $localStorage.raceMode.infoCircuit._id).then(function (res){
      $scope.allSessionInThisCircuit = res.data
          $scope.getStartingPoint(function (pos){
            $scope.initialisationMap(pos)

            $scope.distanceMap = $scope.fullDistance($localStorage.raceMode.infoCircuit.parcours)
            $scope.flightPath = new google.maps.Polyline({
                map: $scope.map,
                path: $localStorage.raceMode.infoCircuit.parcours,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
              })
            $scope.marker = new google.maps.Marker({
                position: new google.maps.LatLng($localStorage.raceMode.infoCircuit.center.latitude, $localStorage.raceMode.infoCircuit.center.longitude),
                map: $scope.map,
                icon: './img/start.png'
            })
            console.log($localStorage.raceMode.infoCircuit.end)
            if ($localStorage.raceMode.infoCircuit.end){
                $scope.marker = new google.maps.Marker({
                    position: new google.maps.LatLng($localStorage.raceMode.infoCircuit.end.latitude, $localStorage.raceMode.infoCircuit.end.longitude),
                    map: $scope.map,
                    icon: './img/end.png'
                })
            }
          })
    });
});