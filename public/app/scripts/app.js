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
		'ngTouch',
		'ngCookies',
		'ui.select',
		'ui.bootstrap',
		'720kb.datepicker',
		'ordinal'
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
			.when('/gameplay/:id', {
				templateUrl: 'views/gameplay.html',
				controller: 'GameplayCtrl',
				controllerAs: 'gameplayController',
				page_title: 'Gameplay'
			})
			.otherwise({
				redirectTo: '/'
			});
	})
	.config(function ($locationProvider) {
		$locationProvider.html5Mode(true);
	})
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
							user: '='
					},
					link: function(scope, element, attrs) {
						scope.showUser = function(id) {
							$window.location.href = '/user/' + id;
						}
					}
			};
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
