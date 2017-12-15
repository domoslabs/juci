//!Author: Reidar Cederqvist <reidar.cederqivst@gmail.com>

// MENU NAME "Multicast Proxy"

JUCI.app
.controller("mcProxySettingsPageCtrl", function($scope, $uci){
	$uci.$sync("mcpd").done(function(){
		if(!$uci.mcpd.mcpd){
			$uci.mcpd.$create({
				".type": "mcpd",
				".name": "mcpd",
			}).done(function(mcpd){
				$scope.mcpd = mcpd;
				$scope.$apply();
			}).fail(function(e){
				console.error("unable to create mcpd section", e);
			});
			return;
		}
		$scope.mcpd = $uci.mcpd.mcpd;
		$scope.$apply();
	});
});
