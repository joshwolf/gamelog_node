'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
	.controller('GameCtrl', function ($scope, $http, $location, $routeParams) {
		$scope.searchRes = [];
		$http.get('/api/game/' + $routeParams.id)
		.then(function(result) {
			$scope.current_game = result.data;
			if($scope.current_user) {
				$http.get('/api/game/plays/' + $routeParams.id)
				.then(function(result) {
					$scope.current_game.gameplays = result.data;
					$scope.new_gameplay = { players : [], date_played : (new Date()) };
				});
			}
		});
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