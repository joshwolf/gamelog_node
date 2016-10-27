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
				_.chain(result.data)
				.reduce(function(opponents, gameplay) {
					var _gameplay = gameplay ? (gameplay.Gameplay || {}) : {};
						var _my_score = _.find(_gameplay.Scores, function(score) { return score.PlayerId == $scope.current_user.id; });
					_.map(_gameplay.Scores || [], function(score) {
						if(score.PlayerId && score.PlayerId != $scope.current_user.id) {
							opponents[score.PlayerId] = opponents[score.PlayerId] || { id: score.PlayerId, full_name: score.Player.full_name, first_name: score.Player.first_name, profile_pic: score.Player.profile_pic, initials: score.Player.initials, count: 0, wins: 0, me_wins: 0, betters: 0, ties: 0, last_played: _gameplay.play_date, last_won: null, me_last_won: null, games: {}, topics: {} };
							opponents[score.PlayerId].games[_gameplay.GameId] = opponents[score.PlayerId].games[_gameplay.GameId] || { id: _gameplay.GameId, title: _gameplay.Game.title, image_thumbnail: _gameplay.Game.image_thumbnail, count: 0, wins: 0, me_wins: 0, betters: 0, ties: 0, last_played: _gameplay.play_date, last_won: null, me_last_won: null };
							opponents[score.PlayerId].count += 1;
							if(_my_score.rank == 1) {
								opponents[score.PlayerId].me_wins += 1;
								opponents[score.PlayerId].games[_gameplay.GameId].me_wins += 1;
								if(!opponents[score.PlayerId].me_last_won || (opponents[score.PlayerId].me_last_won < _gameplay.play_date)) {
									opponents[score.PlayerId].me_last_won = _gameplay.play_date;
								}
								if(!opponents[score.PlayerId].games[_gameplay.GameId].me_last_won || (opponents[score.PlayerId].games[_gameplay.GameId].me_last_won < _gameplay.play_date)) {
									opponents[score.PlayerId].games[_gameplay.GameId].me_last_won = _gameplay.play_date;
								}
							}
							if(score.rank == 1) {
								opponents[score.PlayerId].wins += 1;
								opponents[score.PlayerId].games[_gameplay.GameId].wins += 1;
								if(!opponents[score.PlayerId].last_won || (opponents[score.PlayerId].last_won < _gameplay.play_date)) {
									opponents[score.PlayerId].last_won = _gameplay.play_date;
								}
								if(!opponents[score.PlayerId].games[_gameplay.GameId].last_won || (opponents[score.PlayerId].games[_gameplay.GameId].last_won < _gameplay.play_date)) {
									opponents[score.PlayerId].games[_gameplay.GameId].last_won = _gameplay.play_date;
								}
							}
							if(score.points < _my_score.points) {
								opponents[score.PlayerId].betters += 1;
								opponents[score.PlayerId].games[_gameplay.GameId].betters += 1;
							}
							if(score.points == _my_score.points) {
								opponents[score.PlayerId].ties += 1;
								opponents[score.PlayerId].games[_gameplay.GameId].ties += 1;
							}
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
				},{})
				.orderBy(['last_played'],['desc'])
				.each(function(opponent) {
					opponent.chart_score_data = [opponent.betters, (opponent.count - opponent.betters - opponent.ties), opponent.ties];
					opponent.chart_wins_data = [opponent.me_wins, opponent.wins];
					_.orderBy(opponent.games, (['last_played'],['desc']));
					_.each(opponent.games, function(game) {
						game.chart_score_data = [game.betters, (game.count - game.betters - game.ties), game.ties];
						game.chart_wins_data = [game.me_wins, game.wins];
					});
				})
				.value();
				$scope.opponents_str = JSON.stringify($scope.opponents,null,"    ");
				$scope.chart_score_options = {
					legend : {
						display : true
					},
					title : {
						display : true,
						text : 'Better Score'
					}
				};
				$scope.chart_wins_options = {
					title : {
						display : true,
						text : 'Wins'
					},
					scales : {
						xAxes: [{
							type : 'linear',
							ticks: {
								beginAtZero : true
							}
						}]
					}
				};
			});
	}

	$scope.setCurrentOpponent = function(user) {
		$scope.selected_opponent = user;
		$scope.selected_opponent_games = _.orderBy(Object.values(user.games),['last_played'],['desc']);
		$scope.selected_game = null;
	}
	$scope.setCurrentGame = function(game) {
		$scope.selected_game = game;
	}
});
