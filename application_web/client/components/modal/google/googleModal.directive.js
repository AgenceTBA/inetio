'use strict';

angular.module('applicationWebApp')
  .directive('googlemodal', function () {
    return {
      templateUrl: 'components/modal/google/googleModal.html',
      restrict: 'E',
      controller: 'ModalInstanceCtrl'
    };
  });
