//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("lanConnectionSettingsEdit", function(){
	return {
		templateUrl: "/widgets/lan-connection-settings-edit.html",
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
			$uci.$sync("dhcp").done(function(){
				$uci.dhcp.$create({
					".type":"dhcp",
					".name":$scope.model.lan[".name"],
					"interface": $scope.model.lan[".name"],
					"ignore": !dhcpEnabled
				}).done(function(dhcp){
					$scope.model.dhcp = dhcp;
					$scope.apply(); 
				});
			});
		}else {
			$scope.model.dhcp.ignore.value = !dhcpEnabled;
		}
	}, false);
});
