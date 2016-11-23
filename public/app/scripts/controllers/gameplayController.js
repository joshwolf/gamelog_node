'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
	.controller('GameplayCtrl', function ($scope, $http, $location, $routeParams, $cookies, $rootScope) {
		$scope.searchRes = [];
		$http.get('/api/gameplays/' + $routeParams.id)
		.then(function(result) {
			$scope.gameplay = result.data;
			$scope.current_game = result.data.Game;
			$rootScope.page_title = $scope.current_game.title;
		});
		$scope.addGameplay = function() {
			$http.post('/api/gameplays/new', JSON.stringify({token: $cookies.get('token'), data: $scope.new_gameplay}))
				.success(function(result) {
					$scope.current_game.gameplays.unshift(result);
					$scope.new_gameplay = null;
					$scope.show_gameplay_form = false;
				})
				.error(function(err) {
					console.log(err);
				});
		}
		$scope.show_gameplay_form = false;
		$scope.showGameplayForm = function() {
			if(!$scope.show_gameplay_form) {
				$scope.show_gameplay_form = true;
				$scope.new_gameplay = { game_id: $scope.current_game.id, scores : [], play_date : (new Date()), creator_id: $scope.current_user.id };
				$scope.new_gameplay.scores.push({ player: $scope.current_user});
				$http.get('/api/gameplays/my/recent').then(function(response) {
					$scope.recent_opponents = _.reject(_.uniq(_.flatten(_.map(response.data, function(gameplay) {
						return _.map(gameplay.Gameplay.Scores, function(score) {
								return score.Player;
						});
					})),
					function (player) { return player.full_name; }
					),
					function (player) { return player.id == $scope.current_user.id; }
					);
				});
			}
		}
		$scope.searchRes = [];

		$scope.searchUsers = function($select) {
			if($select.search.length > 3) {
			  return $http.get('/api/users/search/' + $select.search, {
			  }).then(function(response){
			    $scope.searchRes = response.data.slice(0,20);
			    if(!_.some($scope.searchRes, function(user) { return user.full_name.toLowerCase() == $select.search.toLowerCase(); })) {
			    	var parsedName = parseName($select.search);
			    	$scope.searchRes.push({
			    		full_name: $select.search,
			    		first_name: parsedName.firstName,
			    		last_name: parsedName.lastName,
						initials: _.map($select.search.split(' '), function(name) { return name.slice(0,1); }).slice(0,2).join('')
			    	});
			    }
			  });
			}			
		}

		$scope.addUserToGameplay = function(user) {
			if(!_.some($scope.new_gameplay.scores, function(score) { return score.player.full_name == user.full_name; })) {
				$scope.recent_opponents = _.reject($scope.recent_opponents, function(opponent) { return opponent.full_name == user.full_name; });
				$scope.new_gameplay.scores.push({ player: user });
			}
		}

		$scope.removeUserFromGameplay = function(user) {
			$scope.new_gameplay.scores = _.reject($scope.new_gameplay.scores, function(score) { return score.player.id == user.id; } );
		}

		$scope.calculateGameplayOrder = function() {
			var game_scores = _.map($scope.new_gameplay.scores, function(score) { return score.points || 0 }).sort(function(a,b){return a - b}).reverse();
			_.each($scope.new_gameplay.scores, function(score) {
				score.rank = (game_scores.indexOf(score.points)) + 1;
			})
		}
	})

	.controller('GameSearchCtrl', function ($scope, $http, $location, $window) {
		$scope.searchRes = [];
		$scope.searchGames = function($select) {
			var criteria = $select.search.replace(/"/,'');
			if($select.search.length > 3) {
			  return $http.get('/api/games/search/' + criteria + '/0', {
			    params: {
			      title: criteria,
			      exact: 0
			    }
			  }).then(function(response){
			  	var results = response.data;
			  	if($select.search.indexOf('"') > -1) {
			  		results = _.filter(results, function(game) { return (game.name.value.toLowerCase().indexOf(criteria.toLowerCase()) > -1); });
			  	}
			    $scope.searchRes = _.sortBy(results.slice(0,20), function(game) { return game.name.value.toLowerCase().indexOf($select.search.toLowerCase()); });
			  });
			}
		}

		$scope.goToGame = function(game) {
			$http.get('/api/games/' + game.id)
			.then(function(result) {
				$window.location.href = '/game/' + game.id;
			});
		}

	});