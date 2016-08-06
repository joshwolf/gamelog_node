'use strict';

angular.module('gamelogApp')
  .controller('UserStatusCtrl', function ($scope, $window, $http, $location, $cookies, $rootScope) {
  	$http.get('/api/user/me').then(function(response) {
   		var expires = new Date();
    	expires.setDate(expires.getDate() + 60);
	    $cookies.put('user',JSON.stringify(response.data),{'expires':expires});
	    $rootScope.current_user = response.data;
	    $scope.current_user = response.data;
  	});
  	$scope.logout = function() {
  		$scope.current_user = null;
  		$window.location.href = '/logout';
  	}
  	$scope.login = function() {
  		$window.location.href = '/login';
  	}
});
