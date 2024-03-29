'use strict';

/**
 * @ngdoc overview
 * @name gamelogApp
 * @description
 *
 * Main module of the application.
 */
angular
	.module('gamelogApp', [
		'ngAnimate',
		'ngCookies',
		'ngMessages',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngStorage',
		'ngTouch',
		'ngUAParser',
		'ui.select',
		'ui.bootstrap',
		'720kb.datepicker',
		'angular.filter',
		'angularSpinner',
		'chart.js',
		'ordinal',
	])
	.config(function ($locationProvider) {
		$locationProvider.html5Mode(true);
	})
	.config(['$uibTooltipProvider', function ($uibTooltipProvider) {
		 var parser = new UAParser();
		 var result = parser.getResult();
		 var touch = result.device && (result.device.type === 'tablet' || result.device.type === 'mobile');
		 if ( touch ){
			 $uibTooltipProvider.options({trigger: 'dontTrigger'});
		 } else {
			 $uibTooltipProvider.options({trigger: 'mouseenter'});
		}
	}])
	.filter('startFrom', function () {
		return function (input, start) {
			if (input === undefined || input === null || input.length === 0) return [];
			start = +start; //parse to int
			return input.slice(start);
		}
	})
	.filter('ordinalDate', function ($filter) {
		return function (date) {
			return $filter('date')(date, 'MMMM') + ' ' + $filter('ordinal')($filter('date')(date, 'd'));
		}
	})
	.filter('humanizedList', function() {
		return function(items) {
			var _items = (items || []);
			if (_items.length < 2)
			{
				return _items[0];
			}
			else {
				return _items.slice(0, -1).join(', ') + ' and ' + _.last(_items);
			}
		};
	})
	.run(['$rootScope', function($rootScope) {
		$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
				$rootScope.page_title = current.$$route.page_title;
		});
}]);

angular.module('gamelogApp')
	.directive('randomBackgroundColor', function() {
		return {
			link: function(scope, element) {
				element.attr('style','background-color:' + "#000000".replace(/0/g,function(){return (~~((Math.random()*8)+8)).toString(16);}));
			}
		}
	})
	.directive('userIcon', function ($document, $window) {
		return {
				restrict: 'E',
				templateUrl: 'partials/userIcon.html',
				transclude: true,
				scope: {
						user: '=',
						rank: '=',
						noLink: '='
				},
				link: function(scope, element, attrs) {
					scope.showUser = function(id) {
						if(!scope.noLink) {
							$window.location.href = '/user/' + id;
						}
					}
				}
		};
	})
	.directive('userIcons', function ($document, $window) {
		return {
				restrict: 'E',
				templateUrl: 'partials/userIcons.html',
				transclude: true,
				scope: {
						users: '=',
						noLink: '='
				},
				link: function(scope, element, attrs) {
					scope.showUser = function(id) {
						if(!scope.noLink) {
							$window.location.href = '/user/' + id;
						}
					}
				}
		};
	})
	.directive('wishlistIcon', function ($document, $window, $http) {
		return {
				restrict: 'E',
				transclude: true,
				scope: {
					game: '=',
					user: '='
				},
				template: '<i ng-class="[\'fa\',\'wishlist-icon\',{\'fa-star-o\':!onWishlist(game.id)},{\'fa-star\':onWishlist(game.id)}]" ng-click="toggleWishlist(game.id)" ng-attr-title="{{game.id}}">',
				link: function(scope, element, attrs) {
					scope.onWishlist = function(game_id) {
						return scope.user && (scope.user.wishlist.indexOf(game_id) > -1);
					}
					scope.toggleWishlist = function(game_id) {
						if(scope.user.wishlist.indexOf(game_id) == -1) {
							$http.get('/api/wishlistitems/add/' + game_id)
								.success(function(result) {
									scope.user.wishlist.push(game_id);
								});
						} else {
							$http.get('/api/wishlistitems/remove/' + game_id)
								.success(function(result) {
									_.pull(scope.user.wishlist, game_id);
								});
						}
					}
					scope.iconTitle = function(game_id) {
						return (scope.user && (scope.user.wishlist.indexOf(scope.game.id) > -1)) ? 'Remove from \'To Play\' List' : 'Add to \'To Play\' List';
					}
				}
		};
	})
	.directive('gameplay', function ($document, $window) {
		return {
				restrict: 'E',
				templateUrl: 'partials/gameplay.html',
				transclude: true,
				scope: {
					gameplayData: '='
				}
		};
	})
	.directive('resize', function($window) {
	  return {
		link: function(scope) {
		  function onResize(e) {
			// Namespacing events with name of directive + event to avoid collisions
			scope.$broadcast('resize::resize');
			var windowWidth = 'innerWidth' in window ? window.innerWidth : document.documentElement.offsetWidth;
			if(windowWidth <= 992) {
				scope.isMobile = true;
			} else {
				scope.isMobile = false;
			}
			scope.$apply();
		  }

		  function cleanUp() {
			angular.element($window).off('resize', onResize);
		  }

		  angular.element($window).on('resize', onResize);
		  scope.$on('$destroy', cleanUp);
		}
	  }
	})
	.directive('showHelp', function($rootScope, $window) {
		return {
			restrict: 'E',
			template: '<i class="fa fa-question-circle fa-inverse fa-2x" aria-hidden="true"></i>',
			link: function(scope, elem, attrs) {
				$rootScope.showHelp = false;
				$('body').bind('chardinJs:stop', function() {
					$('body').chardinJs('stop');
				});
		        elem.bind('click', function() {
					$('body').chardinJs('start');
				});
			}
		}
	})

angular.module('gamelogApp').config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/main.html',
			controller: 'MainCtrl',
			controllerAs: 'mainController',
			page_title: 'Home'
		})
		.when('/game/:id', {
			templateUrl: 'views/game.html',
			controller: 'GameCtrl',
			controllerAs: 'gameController',
			page_title: 'Game'
		})
		.when('/user/:id', {
			templateUrl: 'views/user.html',
			controller: 'UserCtrl',
			controllerAs: 'userController',
			page_title: 'User'
		})
		.when('/opponents', {
			templateUrl: 'views/opponents.html',
			controller: 'UserOpponentsCtrl',
			controllerAs: 'userController',
			page_title: 'User'
		})
		.when('/review/:year', {
			templateUrl: 'views/review.html',
			controller: 'UserYearReviewCtrl',
			controllerAs: 'userController',
			page_title: 'User'
		})
		.when('/gameplay/:id', {
			templateUrl: 'views/gameplay.html',
			controller: 'GameplayCtrl',
			controllerAs: 'gameplayController',
			page_title: 'Gameplay'
		})
		.when('/gameplays/:id', {
			templateUrl: 'views/gameplay.html',
			controller: 'GameplayCtrl',
			controllerAs: 'gameplayController',
			page_title: 'Gameplay'
		})
		.when('/import', {
			templateUrl: 'views/import.html',
			controller: 'ImportCtrl',
			controllerAs: 'importController'
		})
		.otherwise({
			redirectTo: '/'
		});
});