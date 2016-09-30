//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.directive("juciWiki", function(){
	return {
		template: '<a href="{{href}}" ng-show="showLink" ng-transclude target="_blank"></a>',
		scope: {
			model: "=ngModel"
		},
		transclude: true,
		controller: function($scope, $wiki, $location){
			$scope.href = $wiki.getHref($location.path() + "/" + ($scope.model || ""));
			if($scope.href === "") $scope.showLink = false;
			else $scope.showLink = true;
		},
	}
});
