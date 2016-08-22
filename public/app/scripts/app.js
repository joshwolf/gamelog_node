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
  .directive('randomBackgroundColor', function() {
    return {
      link: function(scope, element) {
        element.attr('style','background-color:' + "#000000".replace(/0/g,function(){return (~~((Math.random()*8)+8)).toString(16);}));
      }
    }
  })
  .directive('userIcon', function ($document) {
      return {
          restrict: 'E',
          templateUrl: 'partials/userIcon.html',
          transclude: true,
          scope: {
              user: '='
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
  });
