'use strict';

/**
 * @ngdoc overview
 * @name gamelogApp
 * @description
 * # gamelogApp
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
		'ordinal',
		'angular.filter',
		'chart.js'
	])
	.config(function ($routeProvider) {
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
	})
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
						console.log(scope);
						if(!scope.noLink) {
							$window.location.href = '/user/' + id;
						}
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
