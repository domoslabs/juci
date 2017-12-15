//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("staticRouteEdit", function(){
	return {
		templateUrl: "widgets/static-route-edit.html",
		scope: {
			route: "=ngModel"
		},
		controller: "staticRouteEditCtrl",
		replace: true
	}
}).directive("staticRouteSixEdit", function(){
	return {
		templateUrl: "widgets/static-route6-edit.html",
		scope: {
			route: "=ngModel"
		},
		controller: "staticRouteEditCtrl",
		replace: true
	}
}).controller("staticRouteEditCtrl", function($scope, $network, $uci){
	$network.getNetworks().done(function(lans){
		$scope.allNetworks = lans.filter(function(net){
			return net[".name"] != "loopback";
		}).map(function(net){
			return { label: net[".name"], value: net[".name"] };
		});
		$scope.$apply();
	});
});
