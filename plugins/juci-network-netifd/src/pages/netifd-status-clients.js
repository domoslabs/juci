//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("NetifdStatusClientsPage", function($scope, $rpc){
	$rpc.router.clients().done(function(clients){
		$rpc.router.clients6().done(function(clients6){
			$scope.clients = Object.keys(clients).map(function(c){
				var cl = clients[c];
				Object.keys(clients6).map(function(c6){
					var cl6 = clients6[c6];
					if(cl.macaddr === cl6.macaddr){	cl.ip6addr = cl6.ip6addr; }
				});
				return cl;
			});
			$scope.$apply();
		});
	});
}); 
