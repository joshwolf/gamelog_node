'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
  $scope.searchRes = [];
  $scope.current_game;

  $scope.searchGames = function($select) {
  	if($select.search.length > 3) {
	  return $http.get('/api/game/search/' + $select.search + '/0', {
	    params: {
	      title: $select.search,
	      exact: 0
	    }
	  }).then(function(response){
	    $scope.searchRes = response.data;
	  });
	}
  }

  $scope.goToGame = function(game) {
    $location.path('/game/' + game.id);
  }
});
