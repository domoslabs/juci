//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("qosIfaceEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/qos-iface-edit.html",
		scope: {
			instance: "=ngModel"
		},
		controller: "qosIfaceEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("qosIfaceEdit", function($scope, $network){
	$network.getNetworks().done(function(nets){
		$scope.ifaces = nets.map(function(net){ return {label:String(net.$info.interface).toUpperCase(), value: net.$info.interface}; });
		$scope.$apply();
	});
});
