'use strict';

angular.module('gamelogApp')
  .controller('UserStatusCtrl', function ($scope, $window, $http, $location, $cookies, $rootScope) {
  	$http.get('/api/users/me').then(function(response) {
   		var expires = new Date();
    	expires.setDate(expires.getDate() + 60);
	    $rootScope.current_user = response.data;
	    $scope.current_user = response.data;
  	});
  	$scope.logout = function() {
  		$scope.current_user = null;
      $cookies.remove('user');
      $cookies.remove('token');
      $cookies.put('next_url',$location.path());
  		$window.location.href = '/logout';
  	}
  	$scope.login = function() {
      $cookies.put('next_url',$location.path());
  		$window.location.href = '/login';
  	}
});
