angular.module('app')

.controller('BuildRaceCtrl', function(Utils, $timeout, $interval, $scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, chronoService, $ionicLoading,$rootScope, $ionicPopup, $timeout,$cordovaDeviceMotion) {
    //VARIABLE GLOBAL

    var TOLERANCE = 0.020
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
// Triggered on a button click, or some other target
$scope.showAlert = function() {
  $scope.data = {}
  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="data.nom">',
    title: 'Name',
    subTitle: 'Enter a name for this track',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
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
    $scope.data['parcours'] = $scope.session.parcours
    $scope.data['center'] = $scope.session['startingPoint']
    $scope.data['auteur'] = $scope.user.email
    $scope.data['isDrag'] = true
    $scope.data['isBuildRace'] = $scope.session.isBuildRace
    $scope.data['end'] = $scope.session.end
    console.log($scope.data)
    $http({
        url: 'http://inetio.coolcode.fr/api/circuits',
        method: "POST",
        data: $scope.data
    })
    .then(function(response) {
       var alertPopup = $ionicPopup.alert({
        title: 'You ended the session',
         template: 'The session is succefully saved : D'
       });
       alertPopup.then(function(res) {
            $state.go('app.main')
       });  
    }, 
    function(response) { // optional
       var alertPopup = $ionicPopup.alert({
         title: 'Something wrong happen',
         template: 'We are truly sorry ... :('
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
    $scope.stopRecord = function () {
        $scope.stoploop()
        $scope.stopTimer()
        $scope.session.isDrag = true
        $scope.getStartingPoint(function (pos){
            $scope.session.end = pos
            $scope.showAlert()
        })
    }
    $scope.start = function () {
        $scope.session = {
            email: $scope.user.email,
            round: 0,
            bestTime: 0,
            vMax: 0,
            bestAngler: 0,
            isBuildRace: true,
            end: {}
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
        $scope.map = new google.maps.Map(document.getElementById("mapbuild"), $scope.mapOptions); 
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
            if ((Utils.getDistance($scope.session.startingPoint, latlong) <= TOLERANCE) && ($scope.inStartZone == false))
            {
                $scope.inStartZone = true
                $scope.session.round++
                $scope.session.isDrag = false
                $scope.stoploop();
            } else if (($scope.inStartZone == true) && (Utils.getDistance($scope.session.startingPoint, latlong) > TOLERANCE)) {
                $scope.inStartZone = false
            } else {}
            $scope.myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
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