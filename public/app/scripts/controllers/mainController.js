'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
  .controller('MainCtrl', function ($scope, $http, $location, $document, $cookies, $window) {
  	if($document[0].cookie.indexOf('token') >= 0) {
   		var expires = new Date();
    	expires.setDate(expires.getDate() + 60);
    	var cookies = $document[0].cookie.split('; ');
    	angular.forEach(cookies, function(cookie,i) {
	    	$cookies.put(cookie.split('=')[0],cookie.split('=')[1],{'expires':expires});
    	})
  	}

  	$http.get('/api/gameplays/recent').then(function (result) {
  		$scope.recent_gameplays = result.data;
  	});

    $scope.login = function() {
      $cookies.put('next_url',$location.path());
      $window.location.href = '/login';
    }

  })
  .controller('ImportCtrl', function($scope, $http) {
    console.log('ok');
    $http.get('/scripts/gamelogger.json').then(function (result) {
      var gameplays = result.data;
      angular.forEach(gameplays, function(g) {
        if(g.game) {
          $http.get('/api/games/' + g.game.id)
            .then(function(result) {
              var gameplay = {};
              
              $http.post('/api/gameplays/new', JSON.stringify({token: $cookies.get('token'), data: gameplay}));
            });
          }
      });
    });
  });
