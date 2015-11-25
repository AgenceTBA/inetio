angular.module('app')

.controller('BuildRaceCtrl', function($timeout, $interval, $scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, chronoService, $ionicLoading,$rootScope, $ionicPopup, $timeout,$cordovaDeviceMotion) {
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


 /*
var CircuitSchema = new Schema({
    nom: String,
    center: {
        longitude: Number,
        latitude: Number
    },
    parcours: [{
      lng: Number,
      lat: Number
    }],
    date: { type: Date, default: Date.now },
    active: Boolean
});
 */

// Triggered on a button click, or some other target
$scope.showAlert = function() {
  $scope.data = {}

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="data.nom">',
    title: 'Nom',
    subTitle: 'Entrez un nom pour ce circuit',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Sauvergarder</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.nom) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.data.nom;
          }
        }
      }
    ]
  });
  myPopup.then(function(res) {
    $scope.data['center'] = $scope.session.parcours
    $scope.data['parcours'] = $scope.session.parcours
    $scope.data['center'] = $scope.session['startingPoint']
    $scope.data['auteur'] = $scope.user.email

        $http({
            url: 'http://inetio.coolcode.fr/api/circuits',
            method: "POST",
            data: $scope.data
        })
        .then(function(response) {
           var alertPopup = $ionicPopup.alert({
            title: 'Vous avez mis fin à votre session',
             template: 'C est dans la boite :D'
           });
           alertPopup.then(function(res) {
                $state.go('app.main')
           });  
        }, 
        function(response) { // optional
           var alertPopup = $ionicPopup.alert({
             title: 'Un probleme est survenue',
             template: 'Aie aie, désole on a un probleme'
           });
           alertPopup.then(function(res) {
                $state.go('app.main')
           });  
        });        


  });
  $timeout(function() {
     myPopup.close(); //close the popup after 3 seconds for some reason
  }, 30000);
 };

 $scope.showAlert2 = function() {
    //verif si user a bien fait un tour
    if ($scope.session.round > 0){
       var alertPopup = $ionicPopup.alert({
         title: 'Vous avez mis fin à votre session',
         template: 'Bravo, votre course vient d etre sauvegarder'
       });
       alertPopup.then(function(res) {
        $http({
            url: 'http://inetio.coolcode.fr/api/circuit',
            method: "POST",
            data: $scope.session
        })
        .then(function(response) {
            console.log('upload api ok')
            $state.go('app.main')
        }, 
        function(response) { // optional
            console.log('upload api pas ok')
            $state.go('app.main')
        });
       });        
    } else {
       var alertPopup = $ionicPopup.alert({
         title: 'Vous avez mis fin à votre session',
         template: 'Oh, meme pas un tour de fait ?? Je n enregistre pas ça'
       });
       alertPopup.then(function(res) {
            $state.go('app.main')
       });  
    }
 };


    $scope.stopRecord = function () {
        $scope.stoploop()
        $scope.stopTimer()
        $scope.session.isDrag = true
        $scope.showAlert()
    }
    $scope.start = function () {
        $scope.session = {
            email: $scope.user.email,
            round: 0,
            bestTime: 0,
            vMax: 0,
            bestAngler: 0
        }
      //ON RECUPERE LE POINT DE DEPART
      $scope.getStartingPoint(function (pos){
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
        $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions); 
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
        $cordovaGeolocation.getCurrentPosition(options).then(function (pos) {
            latlong =  { 'latitude' : pos.coords.latitude, 'longitude' : pos.coords.longitude };

            $scope.latitude  = pos.coords.latitude
            $scope.longitude = pos.coords.longitude

            //RECORD DES POSITIONS AU COURS DU TRAJET
            if (!$scope.session.parcours) 
                $scope.session.parcours = []

            $scope.session.parcours.push({lng: $scope.longitude, lat: $scope.latitude})

            //ON COMPTE LE NOMBRE DE TOUR ET LE MEILLEURS TEMPS AU TOURS
            //SI ON EST AU ROUND 0 CAS SPECIAL
            if ((distance($scope.session.startingPoint, latlong) <= TOLERANCE) && ($scope.inStartZone == false))
            {
                $scope.inStartZone = true
                $scope.session.round++
                $scope.session.isDrag = false
                $scope.stoploop();
            } else if (($scope.inStartZone == true) && (distance($scope.session.startingPoint, latlong) > TOLERANCE)) {
                $scope.inStartZone = false
            } else {}

            $scope.myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
/*            
            $scope.marker = new google.maps.Marker({
                position: $scope.myLatlng,
                map: $scope.map,
                icon: './img/circle.png'
            });
*/
            $scope.flightPath = new google.maps.Polyline({
                map: $scope.map,
                path: $scope.session.parcours,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
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
    //INIT DE LA MAP
      $scope.getStartingPoint(function (pos){
        $scope.initialisationMap(pos)
      })


});