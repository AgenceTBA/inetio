angular.module('app')

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
            });

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