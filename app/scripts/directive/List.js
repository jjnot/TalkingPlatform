(function() {
	'use strict';
	var list = angular.module("ListDirective",[]);
	list.directive('listBase', ['$window', function($window){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			// scope: {}, // {} = isolate, true = child, false/undefined = no change
			controller: function($scope, $element, $attrs, $transclude) {
				this.bindClick = function(callback){
					$element.addClass('hover');
					$window.setTimeOut(function(){
						$element.addClass('hover');
						callback();
					},200);
				}
			},
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			 restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
			// template: '',
			// templateUrl: '',
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function(scope, element, attrs, controller) {
				
			}
		};
	}]);
	list.directive('gameList', ['', function(){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			// scope: {}, // {} = isolate, true = child, false/undefined = no change
			// controller: function($scope, $element, $attrs, $transclude) {},
			require: '^listBase', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
			template: '',
			// templateUrl: '',
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, iElm, iAttrs, controller) {
				
			}
		};
	}]);
})();