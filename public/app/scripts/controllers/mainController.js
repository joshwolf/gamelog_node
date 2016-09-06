'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
  .controller('MainCtrl', function ($scope, $http, $location, $document, $cookies) {
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
});
