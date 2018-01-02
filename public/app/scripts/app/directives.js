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
