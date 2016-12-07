'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
	.controller('GameCtrl', function ($scope, $http, $location, $routeParams, $cookies, $rootScope, $localStorage, $window) {
		$scope.searchRes = [];
	    $scope.login = function() {
	      $cookies.put('next_url',$location.path());
	      $window.location.href = '/login';
	    }
   		$http.get('/api/games/' + $routeParams.id)
		.then(function(result) {
			$scope.current_game = result.data;
			if($scope.current_user) {
				$http.get('/api/games/plays/' + $routeParams.id)
				.then(function(result) {
					$scope.current_game.gameplays = _.sortBy(result.data, function(gameplay) { return gameplay.play_date; }).reverse();
				});
			}
			$rootScope.page_title = $scope.current_game.title;
		});
		$scope.recent_opponents = $localStorage.recent_opponents;
		$scope.addGameplay = function() {
			$http.post('/api/gameplays/new', JSON.stringify({token: $cookies.get('token'), data: $scope.new_gameplay}))
				.success(function(result) {
					$scope.current_game.gameplays.unshift(result);
					$scope.new_gameplay = null;
					$scope.show_gameplay_form = false;
					$localStorage.recent_opponents = null;
				})
				.error(function(err) {
					console.log(err);
				});
		}
		$scope.show_gameplay_form = false;
		$scope.showGameplayForm = function() {
			if(!$scope.show_gameplay_form) {
				$scope.show_gameplay_form = true;
				$scope.new_gameplay = { game_id: $scope.current_game.id, scores : [], play_date : (new Date()), creator_id: $scope.current_user.id, Game: $scope.current_game };
				$scope.new_gameplay.scores.push({ player: $scope.current_user});
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
			if($select.search.length > 3) {
			  return $http.get('/api/games/search/' + $select.search + '/0', {
			    params: {
			      title: $select.search,
			      exact: $select.search.indexOf('"') > -1 ? 1 : 0
			    }
			  }).then(function(response){
			    $scope.searchRes = _.sortBy(response.data.slice(0,20), function(game) { return game.name.value.toLowerCase().indexOf($select.search.toLowerCase()); });
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