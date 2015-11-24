'use strict';

angular.module('applicationWebApp')
  .controller('AdminCtrl', function($scope, $http, Auth, User, $window,$uibModal, Geocoder, socket) {
  //VARIABLE INPUT
  $scope.search = {}

  //AJOUT MAP
    $scope.mapadd = {
      center: {
        latitude: 48.978893,
        longitude: 2.522648
      },
      zoom: 4,
    };
  $scope.updateMainMap = function () {
    $http.get('/api/circuits').then(function(response) {
    $scope.randomMarkers = [];
      for (var i in response.data){
        $scope.randomMarkers.push({
          id : i,
          latitude: response.data[i].center.latitude,
          longitude: response.data[i].center.longitude,
          title: response.data[i].nom
        })
      }
      $scope.displayCollectionCircuit = [].concat(response.data);
    });
  }

  $scope.getLatng = function (adresse) {
    Geocoder.geocodeAddress(adresse).then(function(latlng){
      $scope.randomMarkersAdd = [];
      $scope.mapadd = {
        center: {
          latitude: latlng.lat,
          longitude: latlng.lng
        },
        zoom: 10,
      };
      $scope.randomMarkersAdd.push({
        id : 0,
          latitude: latlng.lat,
          longitude: latlng.lng,
        title: adresse
      })
    });
  }

  $scope.saveNewMap = function (adresse) {
    Geocoder.geocodeAddress(adresse).then(function(latlng){
      $http.post('/api/circuits', {
          nom: adresse,
          center: {
            longitude: latlng.lng,
            latitude: latlng.lat,
          }
      });
      $scope.randomMarkersAdd = [];
      $scope.updateMainMap()
      alert("ok")
    });
  }
 $scope.delete = function(row) {      
  $http.delete('/api/circuits/' + row._id);
 $scope.updateMainMap()

};

    $scope.map = {
      center: {
        latitude: 48.978893,
        longitude: 2.522648
      },
      zoom: 4,
      bounds: {}
    };
    $scope.options = {
      scrollwheel: false
    };

    $scope.randomMarkers = [];
     $scope.updateMainMap()


  $scope.alertMe = function() {
    setTimeout(function() {
      $window.alert('You\'ve selected the alert tab!');
    });
  };

    // Use the User $resource to fetch all users
    $scope.users = User.query();

	$scope.displayCollection = [].concat($scope.users);
    $scope.predicates = ['nom', 'prenom', 'email', 'sexe', 'date'];
    $scope.selectedPredicate = $scope.predicates[0];



    $scope.info = function(user) {
      console.log( User.query())
    };

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size, user) {
    $scope.moreInfo = user

$http
    .get('/api/race_sessions/', {
        params: {
            email: user.email,
        }
     })
     .success(function (response,status) {
      if (response){
        $scope.moreInfo['sessions'] = response
      } else {
        $scope.moreInfo['sessions'] = []
      }
      console.log($scope.moreInfo)
      if (user.provider == "google"){
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'googleModal.html',
          controller: 'ModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return $scope.moreInfo;
            }
          }
        });
      } else if (user.provider == "local") {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'localModal.html',
          controller: 'LocalModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return $scope.moreInfo;
            }
          }
        });
      }

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
      });
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

  })

.filter('unique', function() {
    return function (arr, field) {
        var o = {}, i, l = arr.length, r = [];
        for(i=0; i<l;i+=1) {
            o[arr[i][field]] = arr[i];
        }
        for(i in o) {
            r.push(o[i]);
        }
        return r;
    };
  })
.factory('Geocoder', function ($localStorage, $q, $timeout, $rootScope) {
  var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};

  var queue = [];

  // Amount of time (in milliseconds) to pause between each trip to the
  // Geocoding API, which places limits on frequency.
  var QUERY_PAUSE= 250;

  /**
   * executeNext() - execute the next function in the queue.
   *                  If a result is returned, fulfill the promise.
   *                  If we get an error, reject the promise (with message).
   *                  If we receive OVER_QUERY_LIMIT, increase interval and try again.
   */
  var executeNext = function () {
    var task = queue[0],
      geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address : task.address }, function (result, status) {

      if (status === google.maps.GeocoderStatus.OK) {

        var parsedResult = {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng(),
          formattedAddress: result[0].formatted_address
        };
        locations[task.address] = parsedResult;

        $localStorage.locations = JSON.stringify(locations);

        queue.shift();
        task.d.resolve(parsedResult);

      } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        queue.shift();
        task.d.reject({
          type: 'zero',
          message: 'Zero results for geocoding address ' + task.address
        });
      } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        if (task.executedAfterPause) {
          queue.shift();
          task.d.reject({
            type: 'busy',
            message: 'Geocoding server is busy can not process address ' + task.address
          });
        }
      } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
        queue.shift();
        task.d.reject({
          type: 'denied',
          message: 'Request denied for geocoding address ' + task.address
        });
      } else {
        queue.shift();
        task.d.reject({
          type: 'invalid',
          message: 'Invalid request for geocoding: status=' + status + ', address=' + task.address
        });
      }

      if (queue.length) {
        if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          var nextTask = queue[0];
          nextTask.executedAfterPause = true;
          $timeout(executeNext, QUERY_PAUSE);
        } else {
          $timeout(executeNext, 0);
        }
      }

      if (!$rootScope.$$phase) { $rootScope.$apply(); }
    });
  };

  return {
    geocodeAddress : function (address) {
      var d = $q.defer();

      if (_.has(locations, address)) {
        d.resolve(locations[address]);
      } else {
        queue.push({
          address: address,
          d: d
        });

        if (queue.length === 1) {
          executeNext();
        }
      }

      return d.promise;
    }
  };
});