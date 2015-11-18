angular.module('app')

.controller('RaceModeCtrl', function($timeout, $interval, $scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, chronoService, $ionicLoading,$rootScope) {
    //VARIABLE GLOBAL

    var TOLERANCE = 1
    $scope.user = Auth.getCurrentUser()
    $scope.storage = $localStorage
    $scope.time = Date.now();
    $scope.counter = 0;
    $scope.startStop = true
    function distance(pos1, pos2) {
        var lat1 = pos1.latitude
        var lon1 = pos1.longitude
        var lat2 = pos2.latitude
        var lon2 = pos2.longitude
        //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
        var R = 3958.7558657440545; // Radius of earth in Miles 
        var dLat = toRad(lat2-lat1);
        var dLon = toRad(lon2-lon1); 
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;
        return d;
    }
    function toRad(Value) {
        /** Converts numeric degrees to radians */
        return Value * Math.PI / 180;
    }
    $scope.onTimeout = function(){
        $scope.counter++;
        mytimeout = $timeout($scope.onTimeout,1);
    }

    $scope.statTimer = function () {
      var mytimeout = $timeout($scope.onTimeout,1);      
    }
    
    $scope.stopTimer = function(){
        $timeout.cancel(mytimeout);
    }
    $scope.racing = {
      currentSpeed: 100
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
    $scope.record = function () {
        $scope.start()
    }
    $scope.stopRecord = function () {
        $scope.stoploop()
        $scope.stopTimer()
    }


    $scope.start = function () {
        $scope.session = {
            round: 0,
            bestTime: 0,
            vMax: 0
        }
      //ON RECUPERE LE POINT DE DEPART
      $scope.getStartingPoint(function (pos){
        $scope.session['startingPoint'] = pos
        //initMap
        $scope.initialisationMap()
        //ON START LE CHRONO
        $scope.statTimer()
        //ON RECORD LES POSITIONS
        $scope.startloop()
      })
    }


    var mainloop;

    $scope.initialisationMap = function () {
        $scope.myLatlng = new google.maps.LatLng(47.3590900, 3.3852100);
        $scope.mapOptions = {
            center: $scope.myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }; 
        $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions); 
    }
    $scope.deleteMarkers = function () {
        //Loop through all the markers and remove
        for (var i = 0; i < $scope.marker.length; i++) {
            $scope.marker[i].setMap(null);
        }
        $scope.marker = [];
    };



    $scope.inStartZone = true
    $scope.startloop = function(){
        if (angular.isDefined(mainloop)) 
            return;

        mainloop = $interval(function(){
        
            var options = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            };
            
            $cordovaGeolocation.getCurrentPosition(options).then(function (pos) {
                latlong =  { 'latitude' : pos.coords.latitude, 'longitude' : pos.coords.longitude };

                $scope.latitude  = pos.coords.latitude
                $scope.longitude = pos.coords.longitude
                $scope.racing.currentSpeed = pos.coords.speed

                //RECORD DES POSITIONS AU COURS DU TRAJET
                if (!$scope.session.parcours) 
                    $scope.session.parcours = []

                $scope.session.parcours.push({longitude: $scope.longitude, latitude: $scope.latitude})

                //ON CALCULE LA VMAX
                if ($scope.session.vMax < $scope.racing.currentSpeed) 
                    $scope.session.vMax = $scope.racing.currentSpeed
    
                //ON COMPTE LE NOMBRE DE TOUR ET LE MEILLEURS TEMPS AU TOURS
                //SI ON EST AU ROUND 0 CAS SPECIAL
                if ((distance($scope.session.startingPoint, latlong) <= TOLERANCE) && ($scope.inStartZone == false))
                {
                    $scope.inStartZone = true
                    $scope.session.round ++;
                    if ($scope.session.bestLapTime < $scope.counter) 
                        $scope.session.bestLapTime = $scope.counter
                } else if (($scope.inStartZone == true) && (distance($scope.session.startingPoint, latlong) > TOLERANCE)) {
                    $scope.inStartZone = false
                } else {}
                $scope.myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
                
                $scope.marker = new google.maps.Marker({
                    position: $scope.myLatlng,
                    map: $scope.map,
                    icon: './img/circle.png'
                });

                $scope.map.panTo($scope.myLatlng);
                    $rootScope.currentLocation = latlong;
                }, function(err) {});
        
        },1000);
    };

    $scope.stoploop = function(){
      if (angular.isDefined(mainloop)) {
        $interval.cancel(mainloop);
        mainloop = undefined;
      }
    };

    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stoploop();
    });

/*
    $scope.lat  = position.coords.latitude;
    $scope.long = position.coords.longitude;
    $scope.racing.currentSpeed = position.coords.longitude;
     
    var myLatlng = new google.maps.LatLng($scope.lat, $scope.long);
     
    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };          

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);          

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        icon: './img/been.png'
    });
             
    $scope.map = map;   
*/


    //FONCTION NAVIGATION
    $scope.go = function (url) {
      $state.go(url)
    }

    $scope.signout = function () {
      Auth.logout()
      $state.go("app.login")
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
      $scope.listCircuit = res.data
    });

});