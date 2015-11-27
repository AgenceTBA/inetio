angular.module('app')

.controller('RaceModeCtrl', function(Utils,$timeout, $ionicHistory, $interval, $scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, chronoService, $ionicLoading,$rootScope, $ionicPopup, $timeout,$cordovaDeviceMotion) {
    //VARIABLE GLOBAL

    var TOLERANCE = 1
    $scope.user = Auth.getCurrentUser()
    $scope.storage = $localStorage
    $scope.time = Date.now();
    $scope.counter = 0;
    $scope.angle = 0;
    $scope.startStop = true
    var mainloop;
    $scope.racing = {
      currentSpeed: 100
    }
    $scope.inStartZone = true
        $scope.session = {
            email: $scope.user.email,
            round: 0,
            bestTime: 0,
            vMax: 0,
            bestAngler: 0
        }
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
    //TIMER
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
    //BOUTON START AND STOP
    $scope.record = function () {
        $scope.start()
    }
 // An alert dialog
 $scope.showAlert = function() {
    //verif si user a bien fait un tour
    //if ($scope.session.round > 0){
       var alertPopup = $ionicPopup.alert({
        title: 'You ended the session',
         template: 'This track is succefully saved : D'
       });
       alertPopup.then(function(res) {
        $http({
            url: 'http://inetio.coolcode.fr/api/race_sessions',
            method: "POST",
            data: $scope.session
        })
        .then(function(response) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.main')
        }, 
        function(response) { // optional
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.main')
        });
       });        
    /*
    } else {
       var alertPopup = $ionicPopup.alert({
         title: 'Vous avez mis fin à votre session',
         template: 'Oh, meme pas un tour de fait ?? Je n enregistre pas ça'
       });
       alertPopup.then(function(res) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.main')
       });  
    }
    */
 };

    $scope.stopRecord = function () {
        $scope.stoploop()
        $scope.stopTimer()
        $scope.showAlert()
    }
    $scope.start = function () {
        $scope.session = {
            nom: $localStorage.raceMode.infoCircuit.nom,
            email: $scope.user.email,
            round: 0,
            bestTime: 0,
            vMax: 0,
            bestAngler: 0,
            idCircuit: $localStorage.raceMode.infoCircuit._id
        }
      //ON RECUPERE LE POINT DE DEPART
      Utils.getPosition(function (pos){
        $scope.session['startingPoint'] = pos
        //initMap
        $scope.initialisationMap(pos)
        //ON START LE CHRONO
        $scope.statTimer()
        //ON RECORD LES POSITIONS
        $scope.startloop()
      })
    }
    $scope.initialisationMap = function (pos) {
        $scope.myLatlng = new google.maps.LatLng(pos.latitude, pos.longitude);
        $scope.mapOptions = {
            center: $scope.myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }; 
        $scope.map = new google.maps.Map(document.getElementById("maprace"), $scope.mapOptions); 
    }
    $scope.stoploop = function(){
      if (angular.isDefined(mainloop)) {
        $interval.cancel(mainloop);
        mainloop = undefined;
      }
    }

    $scope.startloop = function(){
        if (angular.isDefined(mainloop)) 
            return;
        mainloop = $interval(function(){
            var options = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            };
    $cordovaDeviceMotion.getCurrentAcceleration().then(function(result) {
        $scope.angle = Math.round(Math.abs(result.x) * 10)
        if ($scope.angle > $scope.session.bestAngler)
            $scope.session.bestAngler = $scope.angle 
    }, function(err) {
      // An error occurred. Show a message to the user
    });

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
    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stoploop();
    });
    //FONCTION NAVIGATION
    $scope.go = function (url) {
      $state.go(url)
    }
    $scope.signout = function () {
      Auth.logout()
      $state.go("login")
    }
    //INIT DE LA MAP
  Utils.getPosition(function (pos){
    $scope.initialisationMap(pos)
  })


});