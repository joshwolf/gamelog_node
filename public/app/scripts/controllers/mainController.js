'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
  .controller('MainCtrl', function ($scope, $http, $location, $document, $cookies, $window) {
  	if($document[0].cookie.indexOf('token') >= 0) {
   		var expires = new Date();
    	expires.setDate(expires.getDate() + 60);
    	var cookies = $document[0].cookie.split('; ');
    	angular.forEach(cookies, function(cookie,i) {
	    	$cookies.put(cookie.split('=')[0],cookie.split('=')[1],{'expires':expires});
    	})
  	}

  	$http.get('/api/gameplays/recent').then(function (result) {
  		$scope.recent_gameplays = result.data;
      $scope.pagination = {
        totalItems : $scope.recent_gameplays.length,
        currentPage : 1,
        numPerPage : 10,
      }
      $scope.setPage();
  	});

    $scope.login = function() {
      $cookies.put('next_url',$location.path());
      $window.location.href = '/login';
    }

    $scope.setPage = function() {
      var current_position = (($scope.pagination.currentPage - 1) * $scope.pagination.numPerPage);
      $scope.pagedGameplays = $scope.recent_gameplays.slice(current_position, current_position + $scope.pagination.numPerPage);
    }
  })
  .controller('ImportCtrl', function($scope, $http, $cookies) {
    console.log('ok');
    $http.get('/scripts/gamelogger.json').then(function (result) {
      var old_gameplays = result.data;
      $scope.gameplays = [];
      angular.forEach(old_gameplays, function(g) {
        if(g.game) {
          $http.get('/api/games/' + g.game.id)
            .then(function(result) {
              var gameplay = {
                creator_id: 1,
                game_id: g.game.id,
                play_date: g.date_played,
                scores: []
              }
              angular.forEach(g.user_gameplay_scores, function(s) {
                var score = {
                  player: {
                    full_name: s.user.name,
                    first_name: s.user.first_name,
                    last_name: s.user.last_name,
                    initials: s.user.first_name.slice(0,1) + s.user.last_name.slice(0,1),
                  },
                  points: s.score,
                  rank: s.rank
                }
                gameplay.scores.push(score);
              });
              $scope.gameplays.push(gameplay);
            });
          }
      });
    });
    $scope.push = function(gameplay) {
      $http.post('/api/gameplays/new', JSON.stringify({token: $cookies.get('token'), data: gameplay}))
      .then($scope.gameplays = _.without($scope.gameplays, gameplay));
    }
  });
