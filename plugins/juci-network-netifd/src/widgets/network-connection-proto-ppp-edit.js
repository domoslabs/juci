//! Author Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoPppEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-ppp-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoPppEdit", 
		replace: true, 
		require: "^ngModel"
	};
})
.controller("networkConnectionProtoPppEdit", function($scope, $rpc){
	$scope.modemDevices = [];
	$rpc.juci.modems.run({"method":"list"}).done(function(data){
		$scope.modemDevices = data.modems.map(function(x){ return { label:x, value:x}});
		$scope.$apply();
	});
})
.directive("networkConnectionProtoPppAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-ppp-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
