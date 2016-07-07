//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("addBwInterfaceEdit", function(){
	return {
		scope: {
			newIface: "=ngModel"
		},
		replace: true,
		templateUrl: "/widgets/add-bw-interface-edit.html",
		controller: "addBwInterfaceEdit"
	};
})
.controller("addBwInterfaceEdit", function($scope, $uci, $network){
	$uci.$sync("qos").done(function(){
		$network.getNetworks().done(function(nets){
			function getLabelValue(x){ return {label:x[".name"].toUpperCase(), value:x[".name"].toUpperCase()}; }
			function isNotLAN(x){ return !(x.value === "LAN"); }
			$scope.nonLANInterfaces = nets.map(getLabelValue).filter(isNotLAN);
			$scope.$apply();
		});
	});
});
