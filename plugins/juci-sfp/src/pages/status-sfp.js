//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("statusSfpCtrl", function($scope, $rpc){
	$rpc.sfp.ddm["get-all"]().done(function(data){
		$scope.ddm = Object.keys(data).map(function(key){ return { key:key, value: data[key] }; });
		$scope.$apply();
	});
	$rpc.sfp.rom["get-all"]().done(function(data){
		$scope.rom = Object.keys(data).map(function(key){ return { key:key, value: data[key] }; });
		$scope.$apply();
	});
});
