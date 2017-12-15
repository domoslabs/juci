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
			console.log(nets);
			$scope.nonLANInterfaces = nets.map(function(x){
				return { label: x[".name"].toUpperCase(), value: x[".name"], is_lan: x.is_lan.value };
			}).filter(function(x){
				if(x.is_lan) return false;
				return !$uci.qos["@interface"].find(function(iface){ return iface[".name"] === x.value; });
			});
			$scope.$apply();
		});
	});
});
