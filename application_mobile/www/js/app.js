// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'starter.controllers',
  'starter.service',
  'ngCordova',
  'ngResource',
  'ngCookies',
  'ngStorage',
  'angular-chrono'
    ])
.constant('defaultLocalisation', {
    'longitude': 6.1799699326036,
    'latitude': 48.689290283084,
    'speed': 0
})
.run(function($rootScope, $ionicPlatform, Auth, $state,$cordovaGeolocation, geoLocation, $localStorage) {
    // Redirect to login if route requires auth and the user is not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
      if (next.authenticate) {
        Auth.isLoggedIn(function(loggedIn) {
          if (!loggedIn) {
            event.preventDefault();
            $state.go('login');
          }
        });
      }
    });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


        $cordovaGeolocation
            .getCurrentPosition()
            .then(function (position) {
                geoLocation.setGeolocation(position.coords.latitude, position.coords.longitude, position.coords.speed);
            }, function (err) {
                 // you need to enhance that point
                $ionicPopup.alert({
                    title: 'Ooops...',
                    template: err.message
                });

                geoLocation.setGeolocation(defaultLocalisation.latitude, defaultLocalisation.longitude, defaultLocalisation.speed)
            });

        // begin a watch
        var watch = $cordovaGeolocation.watchPosition({
            frequency: 1000,
            timeout: 3000,
            enableHighAccuracy: true
        }).then(function () {
            }, function (err) {
                // you need to enhance that point
                geoLocation.setGeolocation(defaultLocalisation.latitude, defaultLocalisation.longitude, defaultLocalisation.speed);
            }, function (position) {
                geoLocation.setGeolocation(position.coords.latitude, position.coords.longitude, position.coords.speed);
                // broadcast this event on the rootScope
                $rootScope.$broadcast('location:change', geoLocation.getGeolocation());
            }
        );
  



  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');

  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.race', {
    url: '/race',
    views: {
      'menuContent': {
        templateUrl: 'templates/race.html',
        controller: 'RaceCtrl'
      }
    }
  })
  .state('app.racemode', {
    url: '/racemode',
    views: {
      'menuContent': {
        templateUrl: 'templates/racemode.html',
        controller: 'RaceModeCtrl'
      }
    }
  })
  .state('app.car', {
      url: '/car',
      views: {
        'menuContent': {
          templateUrl: 'templates/car.html',
          controller: 'CarCtrl'
        }
      }
    })
    .state('app.main', {
      url: '/main',
      views: {
        'menuContent': {
          templateUrl: 'templates/main.html',
          controller: 'MainCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
})

  .factory('authInterceptor', function($rootScope, $q, $cookies, $injector) {
    var state;
    return {
      // Add authorization token to headers
      request: function(config) {
        config.headers = config.headers || {};
        if ($cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if (response.status === 401) {
          (state || (state = $injector.get('$state'))).go('login');
          // remove any stale tokens
          $cookies.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })


  .factory('geoLocation', function ($localStorage) {
    return {
        setGeolocation: function (latitude, longitude, speed) {
            var position = {
                latitude: latitude,
                longitude: longitude,
                speed: speed, 
            }
            $localStorage.setObject('geoLocation', position)
        },
        getGeolocation: function () {
            return glocation = {
                lat: $localStorage.getObject('geoLocation').latitude,
                lng: $localStorage.getObject('geoLocation').longitude,
                speed: $localStorage.getObject('geoLocation').speed,
            }
        }
    }
})


.factory('$localStorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])