//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("simpleLanSettingsEdit", function(){
	return {
		templateUrl: "/widgets/simple-lan-settings-edit.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		controller: "simbleLanSettingsEditCtrl",
		require: "^ngModel"
	};
}).controller("simbleLanSettingsEditCtrl", function($scope, $uci){
	$scope.$watch("model.dhcpEnabled", function(dhcpEnabled){
		if(dhcpEnabled == undefined) return;
		if($scope.model.dhcp == undefined){
			$uci.dhcp.$create({
				".type":"dhcp",
				".name":$scope.model.lan[".name"],
				"interface": $scope.model.lan[".name"],
				"ignore": !dhcpEnabled
			}).done(function(dhcp){
				$scope.model.dhcp = dhcp;
				$scope.apply(); 
			});
		}else {
			$scope.model.dhcp.ignore.value = !dhcpEnabled;
		}
	}, false);
});
