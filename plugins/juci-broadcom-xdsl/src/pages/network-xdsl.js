//!Author: Reidar Cederqvist <reidar.cederqivst@gmail.com>

JUCI.app
.controller("broadcomXdslCtrl", function($scope, $uci, $rpc){
	$rpc.$call("router.system", "info").done(function(data){
		$scope.hasVdsl = data.specs.vdsl;
		$uci.$sync("layer2_interface").done(function(){
			$scope.cap = $uci.layer2_interface.capabilities;
			$scope.$apply();
		});
	});
});
