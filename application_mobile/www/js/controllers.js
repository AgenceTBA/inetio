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

.controller('RaceCtrl', function($scope, Auth, $state, $http, $cordovaGeolocation) {
  $scope.user = Auth.getCurrentUser()
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
          map: map
      });
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


  $scope.go = function (url) {
    $state.go(url)
  }
  $scope.signout = function () {
    Auth.logout()
    $state.go("app.login")
  }
  $http.get('http://169.254.23.187:9000/api/circuits').then(function (res){
    $scope.listCircuit = res.data
  })
$scope.currentPosition()
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

.controller('PlaylistCtrl', function($scope, $stateParams, User) {
})
.controller('LoginCtrl', function($scope, $stateParams,$cordovaOauth, $http, Auth, $state,  $cookies) {
    $scope.user = {};
    $scope.errors = {};


/*
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

          $http.get("http://169.254.23.187:9000/auth/google", config).then(function (res){
            console.log(res)
          })
        }, function(error) {
            console.log(error);
        });
    }
*/
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
                      url: 'http://169.254.23.187:9000/api/users',
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