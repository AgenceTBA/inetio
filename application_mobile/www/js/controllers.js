angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.stop = function() {
    chronoService.stop();
  }
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})
.controller('RaceModeCtrl', function($timeout, $interval, $scope, Auth, $state, $http, $cordovaGeolocation, $localStorage, chronoService, $ionicLoading,$rootScope) {
  
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



  //VARIABLE GLOBAL
  var TOLERANCE = 1
  $scope.user = Auth.getCurrentUser()
  $scope.storage = $localStorage
  $scope.time = Date.now();

    $scope.counter = 0;
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
  $scope.session = {
    round: 0,
    bestTime: 0,
    vMax: 0
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
  $scope.start = function () {
    //ON RECUPERE LE POINT DE DEPART
    $scope.getStartingPoint(function (pos){
      $scope.session = {startingPoint : pos}
      //ON START LE CHRONO
      $scope.statTimer()
      //ON RECORD LES POSITIONS
      $scope.startloop()
    })
  }


  $scope.start()
var mainloop;

$scope.startloop = function(){
  if (angular.isDefined(mainloop) ) return;
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
      if (!$scope.session.parcours) $scope.session.parcours = []
      $scope.session.parcours.push({longitude: $scope.longitude, latitude: $scope.latitude})

      //ON CALCULE LA VMAX
      if ($scope.session.vMax < $scope.racing.currentSpeed) $scope.session.vMax = $scope.racing.currentSpeed
      //ON COMPTE LE NOMBRE DE TOUR ET LE MEILLEURS TEMPS AU TOURS
      if (distance($scope.session.startingPoint, latlong) <= TOLERANCE){
        $scope.session.round ++;
        if ($scope.session.bestLapTime < $scope.counter) $scope.session.bestLapTime = $scope.counter
      }


      $scope.myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
      $scope.mapOptions = {
          center: $scope.myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };          
      $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);          
      $scope.marker = new google.maps.Marker({
          position: $scope.myLatlng,
          map: $scope.map,
          icon: './img/been.png'
      });
      console.log($scope.map)
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

  })
}).filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}])
.controller('RaceCtrl', function($scope, Auth, $state, $http, $cordovaGeolocation, $localStorage) {
  //VARIABLE GLOBAL
  $scope.user = Auth.getCurrentUser()
  $scope.storage = $localStorage
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
  //MAIN DE LA PAGE
  $http.get('http://inetio.coolcode.fr/api/circuits').then(function (res){
    $scope.listCircuit = res.data
    //$scope.currentPosition()
  })
})


.controller('MainCtrl', function($scope, Auth, $state) {
  $scope.user = Auth.getCurrentUser()
  $scope.go = function (url) {
    $state.go(url)
  }
  $scope.signout = function () {
    Auth.logout()
    $state.go("app.login")
  }
})

.controller('CarCtrl', function($scope, $stateParams, User, $state, Auth, $localStorage) {
  $scope.user = Auth.getCurrentUser()
  $scope.storage = $localStorage
  $scope.go = function (url) {
    $state.go(url)
  }
  $scope.signout = function () {
    Auth.logout()
    $state.go("app.login")
  }

  //information récuperer
  console.log($scope.user)
  console.log("info")
  console.log($scope.storage.raceMode)
})
.controller('LoginCtrl', function($scope, $stateParams,$cordovaOauth, $http, Auth, $state,  $cookies) {
    $scope.user = {};
    $scope.errors = {};

    $scope.googleLogin = function() {
        $cordovaOauth.google("951692337658-rqcr7022vdhqi5pggau4m2gjdbddsg20.apps.googleusercontent.com", [
          "https://www.googleapis.com/auth/urlshortener",
          "https://www.googleapis.com/auth/userinfo.email"
          ]).then(function(result) {
          var config = {
            headers: {
              'Authorization': "Bearer " + result.access_token
            }
          };
          $http.get("https://www.googleapis.com/plus/v1/people/me", config).then(function (res){
            console.log('requete aupres de google ok')
                  var newGoogleUser = {
                    email: res.data.emails[0].value,
                    provider: "google",
                    google: res.data
                  }
                  $http({
                      url: 'http://inetio.coolcode.fr/api/users',
                      method: "POST",
                      data: { 'newGoogleUser' : newGoogleUser }
                  })
                  .then(function(response) {
                                console.log('requete aupres de l api ok')
                      Auth.successGoogleAuth(response)
                      .then(function() {
                        $state.go('app.main');
                      })
                      .catch(function(err) {
                          console.log("une  error")
                        $scope.errors.other = err.message;
                      });
                  }, 
                  function(response) { // optional
                          console.log("une putain error")
                  });
          })
        }, function(error) {
            console.log("err2 " + error);
        });
    }

    $scope.localLogin = function() {
      $scope.submitted = true;

        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then(function() {
    //$scope.state.go('app.main');
          $state.go('app.main');
        })
        .catch(function(err) {
          $scope.errors.other = err.message;
        });
    };

});