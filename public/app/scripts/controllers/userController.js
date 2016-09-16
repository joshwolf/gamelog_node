'use strict';

angular.module('gamelogApp')
  	.controller('UserCtrl', function ($scope, $window, $http, $location, $cookies, $routeParams, $rootScope) {
	$http.get('/api/users/' + $routeParams.id)
	.then(function(result) {
	  $scope.user = result.data;
      $scope.games_grouped = false;
	  $rootScope.page_title = $scope.user.full_name;
	  $scope.gameplays = _.sortBy(_.map($scope.user.Scores, function(score) { return score.Gameplay; }), 'play_date').reverse();

	  $scope.gameplay_games = _.chain($scope.gameplays).map((gameplay) => gameplay.Game.title).unique().sort().value();

      $scope.pagination = {
        totalItems : $scope.user.Scores.length,
        currentPage : 1,
        numPerPage : 10,
        totalItemsGrouped: $scope.gameplay_games.length,
        currentPageGrouped: 1,
        numPerPageGrouped: 5
      }

      $scope.setPage();
      $scope.setPageGrouped();
	});

    $scope.setPageGrouped = function() {
      var current_position = (($scope.pagination.currentPageGrouped - 1) * $scope.pagination.numPerPageGrouped);
      var pagedGames = $scope.gameplay_games.slice(current_position, current_position + $scope.pagination.numPerPageGrouped);
      $scope.pagedGameplaysGrouped = _.filter($scope.gameplays, (gameplay) => pagedGames.indexOf(gameplay.Game.title) > -1);
    }

    $scope.setPage = function() {
      var current_position = (($scope.pagination.currentPage - 1) * $scope.pagination.numPerPage);
      $scope.pagedGameplays = $scope.gameplays.slice(current_position, current_position + $scope.pagination.numPerPage);
    }
});

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
