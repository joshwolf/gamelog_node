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
    '720kb.datepicker'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'mainController'
      })
      .when('/game/:id', {
        templateUrl: 'views/game.html',
        controller: 'GameCtrl',
        controllerAs: 'gameController'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function ($locationProvider) {
    $locationProvider.html5Mode(true);
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
  });
