'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
  .controller('AboutCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

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
'use strict';

/**
 * @ngdoc function
 * @name gamelogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gamelogApp
 */
angular.module('gamelogApp')
  .controller('MainCtrl', function ($scope, $http, $location, $document, $cookies, $window, $rootScope, $interval) {

  	if($document[0].cookie.indexOf('token') >= 0) {
   		var expires = new Date();
    	expires.setDate(expires.getDate() + 60);
    	var cookies = $document[0].cookie.split('; ');
    	angular.forEach(cookies, function(cookie,i) {
	    	$cookies.put(cookie.split('=')[0],cookie.split('=')[1],{'expires':expires});
    	})
  	}

    $scope.is_loading = true;

  	$http.get('/api/gameplays/recent').then(function (result) {
  		$scope.recent_gameplays = result.data;
      $scope.pagination = {
        totalItems : $scope.recent_gameplays.length,
        currentPage : 1,
        numPerPage : 10,
      }
      $scope.setPage();
  	})
    .finally(function() { 
      $scope.is_loading = false;
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

'use strict';

angular.module('gamelogApp')
	.controller('UserCtrl', function ($scope, $window, $http, $location, $cookies, $routeParams, $rootScope, $timeout) {
		$scope.global = $rootScope;

	    $scope.is_loading = true;
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
		})
	    .finally(function() { 
	      $scope.is_loading = false;
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

		$scope.paginationSize = function() {
			return $rootScope.isMobile ? 4 : 10;
		}

		$timeout(function() { window.dispatchEvent(new Event('resize')) });
});

angular.module('gamelogApp')
	.controller('UserStatusCtrl', function ($scope, $window, $http, $location, $cookies, $rootScope, $localStorage) {
		$scope.$storage = $localStorage;
		$http.get('/api/users/me').then(function(response) {
			var expires = new Date();
			expires.setDate(expires.getDate() + 60);
			$rootScope.current_user = response.data;
			$scope.current_user = response.data;
			if(!$scope.$storage.recent_opponents) {
				$http.get('/api/gameplays/my/recent').then(function(response) {
					$scope.$storage.recent_opponents = _.chain(response.data)
						.orderBy(function(gameplay) {
							return gameplay.Gameplay.play_date;
						})
						.reverse()
						.map(function(gameplay) {
							return _.map(gameplay.Gameplay.Scores, function(score) {
									return score.Player;
							});
						})
						.flatten()
						.uniqBy(function (player) { return player ? player.full_name : ''; },'id')
						.reject(function (player) { return player ? (player.id == $scope.current_user.id) : false; })
						.slice(0,15)
						.value();
				})
			}
		});


		$scope.logout = function() {
			$scope.current_user = null;
			$cookies.remove('user');
			$cookies.remove('token');
			$cookies.put('next_url',$location.path());
			$window.location.href = '/logout';
			$scope.$storage.$reset();
		}
		$scope.login = function() {
			$cookies.put('next_url',$location.path());
			$window.location.href = '/login';
		}
});

angular.module('gamelogApp')
	.controller('UserOpponentsCtrl', function ($scope, $window, $http, $location, $cookies, $rootScope) {
	$rootScope.page_title = 'You vs. The World';

	if($scope.current_user) {
		$scope.is_loading = true;
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
							opponents[score.PlayerId].games[_gameplay.GameId].topics = _.flatten(_.union([_gameplay.Game.categories, _gameplay.Game.mechanics]));
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
					}
				};
				$scope.chart_game_score_options = {
					legend : {
						display : true,
						position: 'right'
					}
				};
				$scope.chart_wins_options = {
					scales : {
						xAxes: [{
							type : 'linear',
							ticks: {
								beginAtZero : true
							}
						}]
					}
				};
			})
			.finally(function() {
				$scope.is_loading = false;
			});
	}

	$scope.setCurrentOpponent = function(user) {
		$scope.selected_opponent = user;
		$scope.selected_opponent_games = _.orderBy(_.values(user.games),['last_played'],['desc']);
		$scope.selected_game = $scope.selected_opponent_games[0];
		$scope.filterTopics();
		$scope.selected_topics = {};
	}

	$scope.setCurrentGame = function(game) {
		$scope.selected_game = game;
	}

	$scope.filteredByTopic = function(games) {
		if(!$scope.selected_topics || !$scope.selected_topics.topics) {
			return games;
		}
		return _.filter(games, function(game) {
			return _.intersection(game.topics, $scope.selected_topics.topics).length == $scope.selected_topics.topics.length;
		});
	}

    $scope.login = function() {
      $cookies.put('next_url',$location.path());
      $window.location.href = '/login';
    }

	$scope.filterTopics = function() {
		$scope.selected_opponent_topics = _.chain($scope.filteredByTopic($scope.selected_opponent_games))
			.map(function(game) { return game.topics; })
			.flattenDeep()
			.uniq()
			.sort()
			.value();
	}
});

angular.module('gamelogApp')
	.controller('UserYearReviewCtrl', function ($scope, $window, $http, $location, $cookies, $routeParams, $rootScope) {
	$rootScope.page_title = 'Your Year In Review';

	var current_year = $routeParams.year;

	if($scope.current_user) {
		$scope.is_loading = true;
		$http.get('/api/users/' + $scope.current_user.id + '?deep=true')
			.then(function(result) {
				var current_year_gameplays = _.chain(result.data.Scores)
				.filter(function(score) {
					return (new Date(score.Gameplay.play_date)).getFullYear() == current_year;
				})
				.orderBy(['play_date'])
				.value();
				var wins = _.filter(current_year_gameplays, function(gameplay) {
					return gameplay.rank == 1;
				});
				var losses = _.filter(current_year_gameplays, function(gameplay) {
					return gameplay.rank > 1;
				});
				var played_games = _.chain(current_year_gameplays)
					.map('Gameplay')
					//.map('Game')
					.value();
					console.log(played_games)
				$scope.play_count = current_year_gameplays.length;
				$scope.wins_count = wins.length;
				$scope.losses_count = losses.length;
				$scope.first_win = _.head(wins);
				$scope.first_win.other_winners = _.chain($scope.first_win.Gameplay.Scores)
					.filter(function(score) { return score.rank == 1 && score.PlayerId != $scope.current_user.id; })
					.map('Player')
					.value();
				$scope.first_win.other_players = _.chain($scope.first_win.Gameplay.Scores)
					.filter(function(score) { return score.rank > 1 && score.PlayerId != $scope.current_user.id; })
					.map('Player')
					.value();
				$scope.last_win = _.last(wins);
				$scope.last_win.other_winners = _.chain($scope.last_win.Gameplay.Scores)
					.filter(function(score) { return score.rank == 1 && score.PlayerId != $scope.current_user.id; })
					.map('Player')
					.value();
				$scope.last_win.other_players = _.chain($scope.last_win.Gameplay.Scores)
					.filter(function(score) { return score.rank > 1 && score.PlayerId != $scope.current_user.id; })
					.map('Player')
					.value();
				var defeated_players = _.chain(wins)
					.map('Gameplay')
					.map('Scores')
					.flatten()
					.remove(function(score) { return score.PlayerId != $scope.current_user.id; })
					.reduce(function(result,value,key) {
						result[value.PlayerId] = result[value.PlayerId] || { Player: value.Player, count: 0 };
						result[value.PlayerId].count += 1;
						return result;
					}, {})
					.sortBy(function(player) { return player.count; })
					.reverse()
					.value();
				$scope.most_defeated = _.filter(defeated_players, function(player) { return player.count == (_.first(defeated_players)).count; });
				$scope.most_defeated_players = _.map($scope.most_defeated,'Player');
				var defeated_by_players = _.chain(losses)
					.map('Gameplay')
					.map('Scores')
					.flatten()
					.filter(function(score) { return score.rank == 1; })
					.reduce(function(result,value,key) {
						result[value.PlayerId] = result[value.PlayerId] || { Player: value.Player, count: 0 };
						result[value.PlayerId].count += 1;
						return result;
					}, {})
					.sortBy(function(player) { return player.count; })
					.reverse()
					.value();
					console.log(defeated_by_players)
				$scope.most_defeated_by = _.filter(defeated_by_players, function(player) { return player.count == (_.first(defeated_by_players)).count; });
				$scope.most_defeated_by_players = _.map($scope.most_defeated_by,'Player');
			})
			.finally(function() {
				$scope.is_loading = false;
			});
	}

	$scope.setCurrentOpponent = function(user) {
		$scope.selected_opponent = user;
		$scope.selected_opponent_games = _.orderBy(_.values(user.games),['last_played'],['desc']);
		$scope.selected_game = $scope.selected_opponent_games[0];
		$scope.filterTopics();
		$scope.selected_topics = {};
	}

	$scope.setCurrentGame = function(game) {
		$scope.selected_game = game;
	}

	$scope.filteredByTopic = function(games) {
		if(!$scope.selected_topics || !$scope.selected_topics.topics) {
			return games;
		}
		return _.filter(games, function(game) {
			return _.intersection(game.topics, $scope.selected_topics.topics).length == $scope.selected_topics.topics.length;
		});
	}

    $scope.login = function() {
      $cookies.put('next_url',$location.path());
      $window.location.href = '/login';
    }

	$scope.filterTopics = function() {
		$scope.selected_opponent_topics = _.chain($scope.filteredByTopic($scope.selected_opponent_games))
			.map(function(game) { return game.topics; })
			.flattenDeep()
			.uniq()
			.sort()
			.value();
	}
});
