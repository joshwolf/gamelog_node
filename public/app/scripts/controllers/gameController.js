'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
	.controller('GameCtrl', function ($scope, $http, $location, $routeParams, $cookies) {
		$scope.searchRes = [];
		$http.get('/api/game/' + $routeParams.id)
		.then(function(result) {
			$scope.current_game = result.data;
			if($scope.current_user) {
				$http.get('/api/game/plays/' + $routeParams.id)
				.then(function(result) {
					console.log(result);
					$scope.current_game.gameplays = result.data;
					$scope.new_gameplay = { game_id: $scope.current_game.id, scores : [], play_date : (new Date()), creator_id: $scope.current_user.id };
					$scope.new_gameplay.scores.push({ player: $scope.current_user});
				});
			}
		});
		$scope.addGameplay = function() {
			$http.post('/api/gameplay/new', JSON.stringify({token: $cookies.get('token'), data: $scope.new_gameplay}))
				.success(function(result) {
					console.log(result);
					$scope.current_game.gameplays.push(result);
				})
				.error(function(err) {
					console.log(err);
				});
		}
		$scope.show_gameplay_form = false;
		$scope.showGameplayForm = function() {
			$scope.show_gameplay_form = true;
		}
		$scope.searchRes = [];

		$scope.searchUsers = function($select) {
			if($select.search.length > 3) {
			  return $http.get('/api/user/search/' + $select.search, {
			  }).then(function(response){
			    $scope.searchRes = response.data.slice(0,20);
			    if(!_.some($scope.searchRes, (user) => user.full_name.toLowerCase() == $select.search.toLowerCase())) {
			    	var name_array = $select.search.split(' ');
			    	$scope.searchRes.push({
			    		full_name: $select.search, first_name: name_array[0],
						initials: _.map($select.search.split(' '), (name) => name.slice(0,1)).slice(0,2).join('')
			    	});
			    }
			  });
			}			
		}

		$scope.addUserToGameplay = function(user) {
			$scope.new_gameplay.scores.push({ player: user });
		}

		$scope.removeUserFromGameplay = function(user) {
			$scope.new_gameplay.scores = _.reject($scope.new_gameplay.scores, (score) => score.player.id == user.id );
		}

	})

	.controller('GameSearchCtrl', function ($scope, $http, $location, $window) {
		$scope.searchRes = [];
		$scope.searchGames = function($select) {
			if($select.search.length > 3) {
			  return $http.get('/api/game/search/' + $select.search + '/0', {
			    params: {
			      title: $select.search,
			      exact: 0
			    }
			  }).then(function(response){
			    $scope.searchRes = _.sortBy(response.data.slice(0,20), function(game) { return game.name.value.toLowerCase().indexOf($select.search.toLowerCase()); });
			  });
			}
		}

		$scope.goToGame = function(game) {
			$http.get('/api/game/' + game.id)
			.then(function(result) {
				$window.location.href = '/game/' + game.id;
			});
		}

	});