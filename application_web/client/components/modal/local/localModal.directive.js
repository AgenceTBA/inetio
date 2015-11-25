'use strict';

angular.module('applicationWebApp')
  .directive('localmodal', function () {
    return {
      templateUrl: 'components/modal/local/localModal.html',
      restrict: 'E',
      controller: 'LocalModalInstanceCtrl'
    };
  });
