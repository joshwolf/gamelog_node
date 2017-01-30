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
