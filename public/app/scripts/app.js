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
    'ui.select'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/game/:id', {
        templateUrl: 'views/main.html',
        controller: 'GameCtrl',
        controllerAs: 'game'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function ($locationProvider) {
    $locationProvider.html5Mode(true);
  });
