// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('app', [
  'ionic',
  'ngCordova',
  'ngResource',
  'ngCookies',
  'ngStorage',
  'angular-chrono'
    ])

.run(function($rootScope, $ionicPlatform, Auth, $state) {

    // Redirect to login if route requires auth and the user is not logged in
    Auth.getCurrentUser(function(user) {
      console.log(user);
      if (!user.email) {
        event.preventDefault();
        $state.go('login');
      } else {
        $state.go('app.main');
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
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
})

  .factory('authInterceptor', function($rootScope, $q, $localStorage, $injector) {
    var state;
    return {
      // Add authorization token to headers
      request: function(config) {
        config.headers = config.headers || {};
        if ($localStorage.token) {
          config.headers.Authorization = 'Bearer ' + $localStorage.token;
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        console.log("ERROR AUTH");
        for(var i in response)
          console.log(i + " : " + response[i]);
        console.log(response.status);
        if (response.status === 401) {
          (state || (state = $injector.get('$location'))).path('app/login');
          // remove any stale tokens
          $localStorage.token = null;
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

