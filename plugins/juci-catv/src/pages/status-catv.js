//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("statusCatvCtrl", function($rpc, $scope, $config){
	$rpc.$call("catv", "get-all").done(function(data){
		$scope.values = Object.keys(data).map(function(key){
			if(key == "RF") return 	{ key:key, value: String(data[key]).trim() + " dBµV" };
			if(key == "VPD") return	{ key:key, value: String(data[key]).trim() + " dBm" };
			return 					{ key:key, value: String(data[key]).trim() }
		});
		if($config.local.mode == "basic"){
			$scope.values = $scope.values.filter(function(value){
				if(value.key == "VPD" || value.key == "RF enable" || value.key == "47MHz ~ 591MHz" || value.key == "47MHz ~ 431MHz" || value.key == "47MHz ~ 1000MHz" || value.key == "RF") return true;
			});
		}
		$scope.$apply();
	});
});
