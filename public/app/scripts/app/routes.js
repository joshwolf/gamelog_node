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