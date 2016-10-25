'use strict';

angular.module('gamelogApp')
	.controller('UserCtrl', function ($scope, $window, $http, $location, $cookies, $routeParams, $rootScope) {
		$http.get('/api/users/' + $routeParams.id)
		.then(function(result) {
			$scope.user = result.data;
				$scope.games_grouped = false;
			$rootScope.page_title = $scope.user.full_name;
			$scope.gameplays = _.sortBy(_.map($scope.user.Scores, function(score) { return score.Gameplay; }), 'play_date').reverse();

			$scope.gameplay_games = _.chain($scope.gameplays).map(function(gameplay) { return gameplay.Game.title; }).uniq().sort().value();

			$scope.filtered_gameplays = $scope.gameplays;
				$scope.pagination = {
					totalItems : $scope.filtered_gameplays.length,
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
			$scope.pagedGameplaysGrouped = _.filter($scope.gameplays, function(gameplay) { return pagedGames.indexOf(gameplay.Game.title) > -1; });
		}

		$scope.setPage = function() {
			var current_position = (($scope.pagination.currentPage - 1) * $scope.pagination.numPerPage);
			$scope.pagedGameplays = $scope.filtered_gameplays.slice(current_position, current_position + $scope.pagination.numPerPage);
		}

		$scope.filterGameplays = function(game_title) {
			$scope.filtered_gameplays = _.filter($scope.gameplays, function(gameplay) { return gameplay.Game.title == game_title; });
			$scope.pagination.currentPage = 1;
			$scope.pagination.currentPageGrouped = 1;
			$scope.pagination.totalItems = $scope.filtered_gameplays.length;
		$scope.setPage();
		$scope.setPageGrouped();
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

angular.module('gamelogApp')
	.controller('UserOpponentsCtrl', function ($scope, $window, $http, $location, $cookies, $rootScope) {
	if($scope.current_user) {
		$http.get('/api/gameplays/my/recent')
			.then(function(result) {
				$scope.opponents =
				_.reduce(result.data, function(opponents, gameplay) {
					var _gameplay = gameplay ? (gameplay.Gameplay || {}) : {};
					_.map(_gameplay.Scores || [], function(score) {
						if(score.PlayerId && score.PlayerId != $scope.current_user.id) {
							opponents[score.PlayerId] = opponents[score.PlayerId] || { id: score.PlayerId, name: score.Player.full_name, count: 0, last_played: '"2000-01-01T00:00:00.000Z', games: {}, topics: {} };
							opponents[score.PlayerId].games[_gameplay.GameId] = opponents[score.PlayerId].games[_gameplay.GameId] || { id: _gameplay.GameId, title: _gameplay.Game.title, count: 0, last_played: _gameplay.play_date };
							opponents[score.PlayerId].count += 1;
							if(opponents[score.PlayerId].last_played < _gameplay.play_date) {
								opponents[score.PlayerId].last_played = _gameplay.play_date;
							}
							opponents[score.PlayerId].games[_gameplay.GameId].count += 1;
							if(opponents[score.PlayerId].games[_gameplay.GameId].last_played < _gameplay.play_date) {
								opponents[score.PlayerId].games[_gameplay.GameId].last_played = _gameplay.play_date;
							}
							_.each(
								_.flatten(_.union([_gameplay.Game.categories, _gameplay.Game.mechanics])),
								function(topic) { opponents[score.PlayerId].topics[topic] = (opponents[score.PlayerId].topics[topic] || 0) + 1; }
							);
						}
					});
					return opponents;
				},{});
				console.log($scope.opponents);
			});
	}
});
