//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3InterfaceEdit", function(){
	return {
		templateUrl: "widgets/mwan3-interface-edit.html",
		scope: {
			interface: "=ngModel"
		},
		controller: "mwan3InterfaceEditCtrl",
		require: "^ngModel",
		replace: true
	}
}).controller("mwan3InterfaceEditCtrl", function($scope){
	$scope.$watch("interface", function(iface){
		if(!iface)
			return;
		$scope.track_ip = iface.track_ip.value.map(function(track){
			return { value: track };
		});
		$scope.$watch("track_ip", function(ips){
			if(!$scope.interface || !ips)
				return;
			$scope.interface.track_ip.value = ips.map(function(ip){ return ip.value; });
		}, true);
	}, false);
});
