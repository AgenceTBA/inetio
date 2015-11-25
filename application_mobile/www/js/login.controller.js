angular.module('app')

.controller('LoginCtrl', function($scope, $stateParams,$cordovaOauth, $http, Auth, $state,  $cookies, $ionicHistory) {

    $scope.user = {};
    $scope.errors = {};

    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.go = function (url) {
        $state.go(url)
    }

    $scope.$on('$ionicView.beforeEnter', function (e, data) {
        $scope.$root.showMenuIcon = false;
    });
            $scope.load = false

    $scope.googleLogin = function() {
            $scope.load = true
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
                            $scope.load = false
                            $state.go('app.main');
                        })
                        .catch(function(err) {
                            $scope.load = false
                               var alertPopup = $ionicPopup.alert({
                                title: 'Erreur:',
                                 template: 'Connexion au serveur impossible'
                               });
                               alertPopup.then(function(res) {
                                    $state.go('app.main')
                               });  
                            $state.go('app.login');
                        });
                    }, 
                    function(response) { // optional
                        $scope.load = false
                           var alertPopup = $ionicPopup.alert({
                            title: 'Erreur:',
                             template: 'Connexion au serveur impossible'
                           });
                           alertPopup.then(function(res) {
                                $state.go('app.main')
                           });  
                        $state.go('app.login');
                    });
            });

        }, function(error) {
                        $scope.load = false
            console.log("err2 " + error);
        });
    }

    $scope.localLogin = function() {
        $scope.submitted = true;
        $scope.load = true
        Auth.login({
            email: $scope.user.email,
            password: $scope.user.password
        })
        .then(function() {
            $scope.load = false
            $state.go('app.main');
        })
        .catch(function(err) {
        $scope.load = false
               var alertPopup = $ionicPopup.alert({
                title: 'Erreur:',
                 template: 'Connexion au serveur impossible'
               });
               alertPopup.then(function(res) {
                    $state.go('app.main')
               });  
            $state.go('app.login');
        });
    };

});